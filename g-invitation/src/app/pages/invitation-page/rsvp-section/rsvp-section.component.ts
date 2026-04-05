import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core';
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
  @Input() isSubmitting = false;
  @Output() onRsvpSubmit = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly errorState = signal('');
  protected readonly attendeeMenuOpen = signal(false);

  form = this.fb.nonNullable.group({
    attending: [null as boolean | null, Validators.required],
    attendeeCount: [1],
    message: ['', [Validators.maxLength(this.maxMessageLength)]],
  });

  protected attendeeOptions(): number[] {
    const max = this.getMaxAttendeeCount();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  protected attendeeCountLabel(): string {
    const count = this.form.get('attendeeCount')?.value ?? 1;
    return `${count} ${count === 1 ? 'person' : 'people'}`;
  }

  protected toggleAttendeeMenu(): void {
    const attendeeCountControl = this.form.get('attendeeCount');
    if (!attendeeCountControl || attendeeCountControl.disabled) {
      return;
    }

    this.attendeeMenuOpen.update((isOpen) => !isOpen);
  }

  protected selectAttendeeCount(count: number): void {
    this.form.patchValue({ attendeeCount: count });
    this.attendeeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target || this.host.nativeElement.contains(target)) {
      return;
    }

    this.attendeeMenuOpen.set(false);
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
      this.attendeeMenuOpen.set(false);
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

