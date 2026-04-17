import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-invitation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './add-invitation-dialog.component.html',
  styleUrl: './add-invitation-dialog.component.css'
})
export class AddInvitationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddInvitationDialogComponent>);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    guestName1: ['', Validators.required],
    guestName2: [''],
    guestName3: [''],
    numberOfPeople: [1, [Validators.required, Validators.min(1)]],
  });

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;
    const guestNames = [
      formValue.guestName1,
      formValue.guestName2,
      formValue.guestName3,
    ].filter(name => name && name.trim() !== '');

    if (guestNames.length === 0) {
      return;
    }

    // Generate ID from guest names
    const id = guestNames.map(name => name?.trim().replace(/\s+/g, '_')).join('_');

    const result = {
      id,
      guestNames: guestNames as string[],
      numberOfPeople: formValue.numberOfPeople || 1,
    };

    this.dialogRef.close(result);
  }
}

