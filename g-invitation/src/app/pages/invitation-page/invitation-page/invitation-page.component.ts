import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENT_CONFIG } from '../../../data/event.data';
import { INVITEES } from '../../../data/invitees.data';
import { Invitee, RSVPSubmission } from '../../../models/invitation.models';
import { RsvpService } from '../../../services/rsvp.service';
import { EventSectionComponent } from '../event-section/event-section.component';
import { IntroSectionComponent } from '../intro-section/intro-section.component';
import { OpeningScreenComponent } from '../opening-screen/opening-screen.component';
import { RegistrySectionComponent } from '../registry-section/registry-section.component';
import { RsvpSectionComponent } from '../rsvp-section/rsvp-section.component';
import { ThankYouSectionComponent } from '../thank-you-section/thank-you-section.component';
import { TimelineSectionComponent } from '../timeline-section/timeline-section.component';

type SlideKey =
  | 'intro'
  | 'gathering'
  | 'ceremony'
  | 'reception'
  | 'timeline'
  | 'registry'
  | 'rsvp'
  | 'thankyou';

interface InvitationSlide {
  key: SlideKey;
  label: string;
}

@Component({
  selector: 'app-invitation-page',
  standalone: true,
  imports: [
    CommonModule,
    OpeningScreenComponent,
    IntroSectionComponent,
    EventSectionComponent,
    TimelineSectionComponent,
    RegistrySectionComponent,
    RsvpSectionComponent,
    ThankYouSectionComponent,
  ],
  templateUrl: './invitation-page.component.html',
  styleUrl: './invitation-page.component.css',
})
export class InvitationPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rsvpService = inject(RsvpService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly event = EVENT_CONFIG;
  protected readonly invitee = signal<Invitee | null>(null);
  protected readonly showOpening = signal(true);
  protected readonly rsvpSubmitted = signal(false);
  protected readonly submittedResponse = signal<RSVPSubmission | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly bgMusicPlaying = signal(false);
  protected readonly currentSlideIndex = signal(0);
  @ViewChild('bgMusic') bgMusicRef!: ElementRef<HTMLAudioElement>;
  protected readonly targetDate = new Date(this.event.countdownTarget);
  protected readonly ceremonyItems = computed(() => [
    {
      label: this.event.sections.ceremony.title,
      locationName: this.event.sections.ceremony.locationName,
      time: this.event.sections.ceremony.time,
      mapUrl: this.event.sections.ceremony.mapUrl,
    },
  ]);
  protected readonly receptionItems = computed(() => [
    {
      label: this.event.sections.reception.title,
      locationName: this.event.sections.reception.locationName,
      time: this.event.sections.reception.time,
      mapUrl: this.event.sections.reception.mapUrl,
    },
  ]);
  protected readonly slides = computed<InvitationSlide[]>(() => {
    const list: InvitationSlide[] = [{ key: 'intro', label: 'Our Story' }];

    if (this.event.sections.gathering.enabled) {
      list.push({ key: 'gathering', label: this.event.sections.gathering.title });
    }
    if (this.event.sections.ceremony.enabled) {
      list.push({ key: 'ceremony', label: this.event.sections.ceremony.title });
    }
    if (this.event.sections.reception.enabled) {
      list.push({ key: 'reception', label: this.event.sections.reception.title });
    }
    if (this.event.sections.timeline.enabled) {
      list.push({ key: 'timeline', label: this.event.sections.timeline.title });
    }
    if (this.event.sections.registry.enabled) {
      list.push({ key: 'registry', label: this.event.sections.registry.title });
    }
    if (this.event.rsvp.enabled && this.invitee()) {
      list.push({ key: this.rsvpSubmitted() ? 'thankyou' : 'rsvp', label: 'RSVP' });
    }

    return list;
  });

  private pointerStartX: number | null = null;
  private pointerStartY: number | null = null;
  private wheelLocked = false;

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const max = this.slides().length - 1;
      if (max >= 0 && this.currentSlideIndex() > max) {
        this.currentSlideIndex.set(max);
      }
    });
  }

  ngOnInit(): void {
    const eventSlug = this.route.snapshot.paramMap.get('eventSlug');
    const guestId = this.route.snapshot.paramMap.get('guestId');

    if (!eventSlug && !guestId) {
      this.router.navigateByUrl(`/${this.event.eventSlug}/${INVITEES[0].id}`);
      return;
    }

    if (eventSlug !== this.event.eventSlug || !guestId) {
      this.router.navigateByUrl('/not-found');
      return;
    }

    const invitee = INVITEES.find((item: Invitee) => item.id === guestId) ?? null;
    if (!invitee) {
      this.router.navigateByUrl('/not-found');
      return;
    }

    this.invitee.set(invitee);

    if (isPlatformBrowser(this.platformId)) {
      this.loadExistingResponse(invitee.id);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async loadExistingResponse(inviteeId: string): Promise<void> {
    try {
      const existingResponse = await this.rsvpService.read(inviteeId, this.event.eventSlug);
      if (existingResponse) {
        this.submittedResponse.set(existingResponse);
        this.rsvpSubmitted.set(true);
      }
    } catch (error) {
      console.error('Error loading existing RSVP response:', error);
    }
  }

  protected onOpeningTap(): void {
    this.startBgMusicFromUserGesture();
    this.showOpening.set(false);
    this.currentSlideIndex.set(0);
  }

  protected toggleBgMusic(): void {
    const audio = this.getBgMusicElement();
    if (!audio) {
      return;
    }

    if (audio.paused || audio.ended) {
      audio.muted = false;
      audio.play().catch((e) => console.error('Audio play failed:', e));
      this.bgMusicPlaying.set(true);
    } else {
      audio.pause();
      this.bgMusicPlaying.set(false);
    }
  }

  private startBgMusicFromUserGesture(): void {
    const audio = this.getBgMusicElement();
    if (!audio) {
      return;
    }

    audio.muted = false;
    audio.play()
      .then(() => this.bgMusicPlaying.set(true))
      .catch((error) => {
        console.error('Audio play failed:', error);
        this.bgMusicPlaying.set(false);
      });
  }

  private getBgMusicElement(): HTMLAudioElement | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return this.bgMusicRef?.nativeElement ?? (document.getElementById('bg-music') as HTMLAudioElement | null);
  }

  protected nextSlide(): void {
    const maxIndex = this.slides().length - 1;
    if (this.currentSlideIndex() < maxIndex) {
      this.currentSlideIndex.update((i) => i + 1);
    }
  }

  protected previousSlide(): void {
    if (this.currentSlideIndex() > 0) {
      this.currentSlideIndex.update((i) => i - 1);
    }
  }

  protected goToSlide(index: number): void {
    if (index < 0 || index > this.slides().length - 1) {
      return;
    }
    this.currentSlideIndex.set(index);
  }

  protected onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a')) {
      return;
    }

    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null || this.pointerStartY === null) {
      return;
    }

    const deltaX = event.clientX - this.pointerStartX;
    const deltaY = event.clientY - this.pointerStartY;
    this.pointerStartX = null;
    this.pointerStartY = null;

    this.handleSwipe(deltaX, deltaY);
  }

  protected onTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a')) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    this.pointerStartX = touch.clientX;
    this.pointerStartY = touch.clientY;
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.pointerStartX === null || this.pointerStartY === null) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.pointerStartX;
    const deltaY = touch.clientY - this.pointerStartY;
    this.pointerStartX = null;
    this.pointerStartY = null;

    this.handleSwipe(deltaX, deltaY);
  }

  private handleSwipe(deltaX: number, deltaY: number): void {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = 45;

    if (absX < threshold && absY < threshold) {
      return;
    }

    if (absX >= absY) {
      if (deltaX < 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
      return;
    }

    if (deltaY < 0) {
      this.nextSlide();
    } else {
      this.previousSlide();
    }
  }

  protected onWheel(event: WheelEvent): void {
    if (this.wheelLocked) {
      return;
    }

    if (Math.abs(event.deltaY) < 10) {
      return;
    }

    this.wheelLocked = true;
    if (event.deltaY > 0) {
      this.nextSlide();
    } else {
      this.previousSlide();
    }

    setTimeout(() => {
      this.wheelLocked = false;
    }, 350);
  }

  protected async onRsvpSubmit(formData: any): Promise<void> {
    const invitee = this.invitee();
    if (!invitee) return;

    this.isSubmitting.set(true);
    this.submitError.set('');

    try {
      const payload: RSVPSubmission = {
        inviteeId: invitee.id,
        eventSlug: this.event.eventSlug,
        guestNames: invitee.guestNames,
        guestNamesDisplay: invitee.guestNames.join(' & '),
        allowedPeople: invitee.numberOfPeople,
        attending: formData.attending,
        attendeeCount: formData.attendeeCount,
        message: formData.message,
        submittedFromRoute: invitee.id,
      };

      await this.rsvpService.submit(payload);

      const updated = await this.rsvpService.read(invitee.id, this.event.eventSlug);
      if (updated) {
        this.submittedResponse.set(updated);
      }
      this.rsvpSubmitted.set(true);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      this.submitError.set('Failed to submit RSVP. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

