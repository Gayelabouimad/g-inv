import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Invitee } from '../../../models/invitation.models';

@Component({
  selector: 'app-rsvp-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rsvp-section.component.html',
  styleUrl: './rsvp-section.component.css',
  host: {
    '[style.--accent-color]': 'accentColor',
  },
})
export class RsvpSectionComponent implements OnInit {
  @Input() invitee: Invitee | null = null;
  @Input() deadlineText = '';
  @Input() maxMessageLength = 120;
  @Input() accentColor = '#d6c3a5';
  @Output() onRsvpSubmit = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);

  protected readonly submittingState = signal(false);
  protected readonly errorState = signal('');

  form = this.fb.nonNullable.group({
    attending: [null as boolean | null, Validators.required],
    attendeeCount: [1],
    message: ['', [Validators.maxLength(this.maxMessageLength)]],
  });

  protected attendeeOptions(): number[] {
    const max = this.getMaxAttendeeCount();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  private getMaxAttendeeCount(): number {
    return Math.max(1, this.invitee?.numberOfPeople ?? 1);
  }

  ngOnInit(): void {
    this.updateAttendeeValidation(this.form.get('attending')?.value ?? null);

    if (this.invitee?.numberOfPeople) {
      this.form.patchValue({
        attendeeCount: this.getMaxAttendeeCount(),
      });
    }
  }

  private updateAttendeeValidation(attending: boolean | null): void {
    const attendeeCountControl = this.form.get('attendeeCount');
    if (!attendeeCountControl) {
      return;
    }

    if (attending === true) {
      attendeeCountControl.enable({ emitEvent: false });
      attendeeCountControl.setValidators([Validators.required, Validators.min(1)]);
      if ((attendeeCountControl.value ?? 0) < 1) {
        attendeeCountControl.setValue(this.getMaxAttendeeCount());
      }
    } else if (attending === false) {
      attendeeCountControl.setValue(0, { emitEvent: false });
      attendeeCountControl.clearValidators();
      attendeeCountControl.disable({ emitEvent: false });
    } else {
      attendeeCountControl.enable({ emitEvent: false });
      attendeeCountControl.clearValidators();
    }

    attendeeCountControl.updateValueAndValidity();
  }

  protected setAttending(attending: boolean): void {
    this.form.patchValue({ attending });
    this.updateAttendeeValidation(attending);
  }

  protected onSubmit(): void {
    if (!this.form.valid) return;

    const formValue = this.form.getRawValue();
    this.onRsvpSubmit.emit({
      attending: formValue.attending,
      attendeeCount: formValue.attending ? formValue.attendeeCount : 0,
      message: formValue.message,
    });
  }
}

