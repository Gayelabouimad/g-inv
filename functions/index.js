const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Email configuration
const NOTIFICATION_EMAILS = ['elia.hage1@gmail.com', 'gayelabouimad@gmail.com'];

// Configure your email service
// Option 1: Use Gmail (requires app password)
// Option 2: Use SendGrid, Mailgun, etc.
// For now, this is configured for Gmail with app passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gayelabouimad@gmail.com', // Replace with your Gmail
    pass: 'nebq vrcf ndxu ihob', // Replace with Gmail App Password
  },
});

function hasRsvpResponse(data) {
  return data && (data.attending === true || data.attending === false);
}

async function sendRsvpEmail(type, data) {
  const { guestNamesDisplay, attending, attendeeCount, message, createdAt, updatedAt, eventSlug } = data;
  const timestamp = createdAt || updatedAt || new Date().toISOString();
  const isCreated = type === 'created';

  const mailOptions = {
    from: 'RSVP System <gayelabouimad@gmail.com>',
    to: NOTIFICATION_EMAILS.join(', '),
    subject: isCreated ? `🎉 New RSVP: ${guestNamesDisplay}` : `📝 RSVP Updated: ${guestNamesDisplay}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${isCreated ? '#1976d2' : '#ff9800'}; margin-bottom: 20px;">${isCreated ? '✨ New RSVP Received' : '📝 RSVP Updated'}</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Guest(s):</strong> ${guestNamesDisplay}</p>
          <p style="margin: 5px 0;"><strong>Attending:</strong> ${attending ? '✅ Yes' : '❌ No'}</p>
          ${attending ? `<p style="margin: 5px 0;"><strong>Number of Attendees:</strong> ${attendeeCount}</p>` : ''}
          ${message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${message}</p>` : ''}
          <p style="margin: 5px 0;"><strong>${isCreated ? 'Submitted' : 'Updated'}:</strong> ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <p style="color: #666; font-size: 12px;">Event: ${eventSlug}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send email notification when a new RSVP is created
 */
exports.sendRsvpCreatedEmail = onDocumentCreated(
  'rsvp-elia-gayel/{documentId}',
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log('No data associated with the event');
        return;
      }

      const data = snapshot.data();

      // Only send email if this is an RSVP submission (not an invitee record)
      if (!hasRsvpResponse(data)) {
        console.log('Skipping notification - not an RSVP submission');
        return;
      }

      await sendRsvpEmail('created', data);
      console.log(`Email sent successfully for RSVP: ${data.guestNamesDisplay}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
);

/**
 * Send email notification when an RSVP is updated
 */
exports.sendRsvpUpdatedEmail = onDocumentUpdated(
  'rsvp-elia-gayel/{documentId}',
  async (event) => {
    try {
      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();

      // Only send email if this is an RSVP update (not an invitee-only/admin update)
      if (!hasRsvpResponse(afterData)) {
        console.log('Skipping notification - not an RSVP submission');
        return;
      }

      // Check if any RSVP fields actually changed (not just table or other fields)
      const rsvpFieldsChanged =
        beforeData.attending !== afterData.attending ||
        beforeData.attendeeCount !== afterData.attendeeCount ||
        beforeData.message !== afterData.message;

      if (!rsvpFieldsChanged) {
        console.log('Skipping notification - only non-RSVP fields changed (e.g., table assignment)');
        return;
      }

      const wasRsvpBefore = hasRsvpResponse(beforeData);
      const notificationType = wasRsvpBefore ? 'updated' : 'created';

      await sendRsvpEmail(notificationType, afterData);
      console.log(`${notificationType === 'created' ? 'Creation' : 'Update'} email sent successfully for RSVP: ${afterData.guestNamesDisplay}`);
    } catch (error) {
      console.error('Error sending update email:', error);
    }
  }
);

