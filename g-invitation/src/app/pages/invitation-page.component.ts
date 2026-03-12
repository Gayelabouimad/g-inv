import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENT_CONFIG } from '../data/event.data';
import { INVITEES } from '../data/invitees.data';
import { Invitee, RSVPSubmission } from '../models/invitation.models';
import { RsvpService } from '../services/rsvp.service';

@Component({
  selector: 'app-invitation-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page" [style.--accent]="event.branding.accentColor">
      <ng-container *ngIf="notFound(); else content">
        <div class="card center">
          <h1>Invitation not found</h1>
          <p>Please check your invitation link.</p>
        </div>
      </ng-container>

      <ng-template #content>
        <div class="hero card">
          <h1>{{ event.couple.primaryNames }}</h1>
          <p>{{ event.couple.titleLine }}</p>
          <p class="muted">{{ event.introText }}</p>
          <p class="muted">{{ inviteeDisplay() }}</p>
          <p class="countdown">{{ countdownLabel() }}</p>
        </div>

        <section class="card" *ngIf="event.sections.gathering.enabled">
          <h2>{{ event.sections.gathering.title }}</h2>
          <p>{{ event.sections.gathering.description }}</p>
          <div *ngFor="let item of event.sections.gathering.items" class="row">
            <strong>{{ item.label }}</strong>
            <span>{{ item.locationName }} - {{ item.time }}</span>
          </div>
        </section>

        <section class="card" *ngIf="event.sections.ceremony.enabled">
          <h2>{{ event.sections.ceremony.title }}</h2>
          <p>{{ event.sections.ceremony.dateText }} - {{ event.sections.ceremony.time }}</p>
          <p>{{ event.sections.ceremony.locationName }}</p>
        </section>

        <section class="card" *ngIf="event.sections.reception.enabled">
          <h2>{{ event.sections.reception.title }}</h2>
          <p>{{ event.sections.reception.dateText }} - {{ event.sections.reception.time }}</p>
          <p>{{ event.sections.reception.locationName }}</p>
        </section>

        <section class="card" *ngIf="event.sections.registry.enabled">
          <h2>{{ event.sections.registry.title }}</h2>
          <p>{{ event.sections.registry.text }}</p>
          <p><strong>{{ event.sections.registry.name }}</strong> - {{ event.sections.registry.accountNumber }}</p>
        </section>

        <section class="card" *ngIf="event.rsvp.enabled && invitee()">
          <h2>RSVP</h2>
          <p class="muted">{{ event.rsvp.deadlineText }}</p>

          <ng-container *ngIf="!rsvpSubmitted(); else thankYou">
            <form [formGroup]="rsvpForm" (ngSubmit)="submitRsvp()">
              <label>Will you attend?</label>
              <div class="row gap">
                <button type="button" (click)="setAttending(true)">Yes</button>
                <button type="button" (click)="setAttending(false)">No</button>
              </div>

              <div *ngIf="rsvpForm.value.attending === true">
                <label>Number of attendees</label>
                <select formControlName="attendeeCount">
                  <option *ngFor="let n of attendeeOptions()" [value]="n">{{ n }}</option>
                </select>
              </div>

              <label>Message (optional)</label>
              <textarea formControlName="message" [maxLength]="event.rsvp.maxMessageLength"></textarea>

              <button type="submit" [disabled]="submitting()">Submit RSVP</button>
            </form>

            <p class="error" *ngIf="submitError()">{{ submitError() }}</p>
          </ng-container>

          <ng-template #thankYou>
            <div class="thank-you">
              <h3>Thank you!</h3>
              <p class="thank-you-message">Your response has been recorded.</p>
              
              <div class="response-summary">
                <div class="summary-item">
                  <strong>Attending:</strong>
                  <span>{{ submittedResponse()?.attending ? 'Yes' : 'No' }}</span>
                </div>
                
                <div class="summary-item" *ngIf="submittedResponse()?.attending">
                  <strong>Number of Guests:</strong>
                  <span>{{ submittedResponse()?.attendeeCount }}</span>
                </div>
                
                <div class="summary-item" *ngIf="submittedResponse()?.message">
                  <strong>Message:</strong>
                  <span>{{ submittedResponse()?.message }}</span>
                </div>
              </div>
            </div>
          </ng-template>
        </section>
      </ng-template>
    </div>
  `,
  styleUrl: './invitation-page.component.css',
})
export class InvitationPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly rsvpService = inject(RsvpService);

  protected readonly event = EVENT_CONFIG;
  protected readonly invitee = signal<Invitee | null>(null);
  protected readonly notFound = signal(false);

  protected readonly submitting = signal(false);
  protected readonly submitSuccess = signal(false);
  protected readonly submitError = signal('');
  protected readonly rsvpSubmitted = signal(false);
  protected readonly submittedResponse = signal<RSVPSubmission | null>(null);

  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly countdown = signal('');
  protected readonly countdownLabel = computed(() => this.countdown());

  protected readonly rsvpForm = this.fb.nonNullable.group({
    attending: [null as boolean | null, Validators.required],
    attendeeCount: [1, [Validators.required, Validators.min(1)]],
    message: [''],
  });

  ngOnInit(): void {
    const eventSlug = this.route.snapshot.paramMap.get('eventSlug');
    const routeSlug = this.route.snapshot.paramMap.get('routeSlug');

    if (!eventSlug && !routeSlug) {
      this.router.navigateByUrl(`/${this.event.eventSlug}/${INVITEES[0].routeSlug}`);
      return;
    }

    if (eventSlug !== this.event.eventSlug || !routeSlug) {
      this.notFound.set(true);
      return;
    }

    const invitee = INVITEES.find((item) => item.routeSlug === routeSlug) ?? null;
    if (!invitee) {
      this.notFound.set(true);
      return;
    }

    this.invitee.set(invitee);
    this.rsvpForm.patchValue({ attendeeCount: invitee.numberOfPeople });
    this.startCountdown();

    // Load existing RSVP response if available
    this.loadExistingResponse(invitee.id);
  }

  private async loadExistingResponse(inviteeId: string): Promise<void> {
    try {
      const existingResponse = await this.rsvpService.read(inviteeId, this.event.eventSlug);
      if (existingResponse) {
        this.submittedResponse.set(existingResponse);
        this.rsvpSubmitted.set(true);
      }
    } catch (error) {
      // Silently fail - if we can't load response, just show form
      console.error('Error loading existing RSVP response:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  protected attendeeOptions(): number[] {
    const max = this.invitee()?.numberOfPeople ?? 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  protected inviteeDisplay(): string {
    return this.invitee()?.guestNames.join(' & ') ?? 'Guest';
  }

  protected setAttending(attending: boolean): void {
    this.rsvpForm.patchValue({ attending, attendeeCount: attending ? (this.invitee()?.numberOfPeople ?? 1) : 0 });
  }

  protected async submitRsvp(): Promise<void> {
    const invitee = this.invitee();
    if (!invitee) {
      return;
    }
    if (this.rsvpForm.invalid || this.rsvpForm.value.attending === null) {
      this.submitError.set('Please complete RSVP form correctly.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');
    this.submitSuccess.set(false);

    const payload: RSVPSubmission = {
      inviteeId: invitee.id,
      accessToken: invitee.accessToken,
      eventSlug: this.event.eventSlug,
      guestNames: invitee.guestNames,
      guestNamesDisplay: invitee.guestNames.join(' & '),
      allowedPeople: invitee.numberOfPeople,
      attending: this.rsvpForm.value.attending as boolean,
      attendeeCount: this.rsvpForm.value.attendeeCount ?? invitee.numberOfPeople,
      message: this.rsvpForm.value.message ?? '',
      submittedFromRoute: invitee.routeSlug,
    };

    try {
      await this.rsvpService.submit(payload);
      this.submittedResponse.set(payload);
      this.rsvpSubmitted.set(true);
      this.submitSuccess.set(true);
    } catch (error) {
      this.submitError.set('Failed to submit RSVP. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  private startCountdown(): void {
    const update = () => {
      const target = new Date(this.event.countdownTarget).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        this.countdown.set('The celebration day is here.');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      this.countdown.set(`${days}d ${hours}h ${minutes}m until the wedding`);
    };

    update();
    this.timer = setInterval(update, 1000 * 30);
  }
}

