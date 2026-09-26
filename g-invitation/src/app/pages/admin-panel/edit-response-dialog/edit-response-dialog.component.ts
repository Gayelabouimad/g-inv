import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { InviteeRecord } from '../../../models/invitation.models';

export interface EditResponseDialogData {
  invitee: InviteeRecord;
}

export interface EditResponseResult {
  attending: boolean;
  attendeeCount: number;
  message: string;
}

@Component({
  selector: 'app-edit-response-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
  ],
  templateUrl: './edit-response-dialog.component.html',
  styleUrl: './edit-response-dialog.component.css',
})
export class EditResponseDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(MAT_DIALOG_DATA) as EditResponseDialogData;
  private readonly dialogRef = inject(MatDialogRef<EditResponseDialogComponent>);

  protected form!: FormGroup;
  protected maxCapacity: number = 0;

  ngOnInit(): void {
    const invitee = this.data.invitee;
    this.maxCapacity = Number(invitee.numberOfPeople) || 1;

    this.form = this.fb.group({
      attending: [invitee.attending ?? false, Validators.required],
      attendeeCount: [
        invitee.attendeeCount ?? this.maxCapacity,
        [Validators.required, Validators.min(1), Validators.max(this.maxCapacity)],
      ],
      message: [invitee.message ?? '', Validators.maxLength(500)],
    });
  }

  protected get guestNames(): string {
    return this.data.invitee.guestNamesDisplay || this.data.invitee.guestNames.join(' & ');
  }

  protected onAttendingChange(): void {
    const attendingControl = this.form.get('attending');
    const attendeeCountControl = this.form.get('attendeeCount');

    if (attendingControl?.value) {
      attendeeCountControl?.enable();
      if (!attendeeCountControl?.value) {
        attendeeCountControl?.setValue(this.maxCapacity);
      }
    } else {
      attendeeCountControl?.disable();
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      return;
    }

    const result: EditResponseResult = {
      attending: this.form.value.attending,
      attendeeCount: this.form.value.attending ? this.form.value.attendeeCount : 0,
      message: this.form.value.message,
    };

    this.dialogRef.close(result);
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }
}

