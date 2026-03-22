import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-rsvp-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './delete-rsvp-confirm-dialog.component.html',
  styleUrl: './delete-rsvp-confirm-dialog.component.css',
})
export class DeleteRsvpConfirmDialogComponent {
  readonly data = inject<{ guestNamesDisplay: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeleteRsvpConfirmDialogComponent>);

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}

