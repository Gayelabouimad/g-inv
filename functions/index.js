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
      if (!data.attending && data.attending !== false) {
        console.log('Skipping notification - not an RSVP submission');
        return;
      }

      const { guestNamesDisplay, attending, attendeeCount, message, createdAt, eventSlug } = data;

      const mailOptions = {
        from: 'RSVP System <gayelabouimad@gmail.com>',
        to: NOTIFICATION_EMAILS.join(', '),
        subject: `🎉 New RSVP: ${guestNamesDisplay}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #1976d2; margin-bottom: 20px;">✨ New RSVP Received</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Guest(s):</strong> ${guestNamesDisplay}</p>
              <p style="margin: 5px 0;"><strong>Attending:</strong> ${attending ? '✅ Yes' : '❌ No'}</p>
              ${attending ? `<p style="margin: 5px 0;"><strong>Number of Attendees:</strong> ${attendeeCount}</p>` : ''}
              ${message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${message}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(createdAt).toLocaleString()}</p>
            </div>
            
            <p style="color: #666; font-size: 12px;">Event: ${eventSlug}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully for RSVP: ${guestNamesDisplay}`);
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

      // Only send email if this is an RSVP update (not an invitee record)
      if (!afterData.attending && afterData.attending !== false) {
        console.log('Skipping notification - not an RSVP submission');
        return;
      }

      // Check if it's a new RSVP or just an update
      const wasRsvpBefore = beforeData.attending !== undefined && beforeData.attending !== null;
      if (!wasRsvpBefore) {
        // This is a new RSVP, the onCreate trigger will handle it
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

      const { guestNamesDisplay, attending, attendeeCount, message, updatedAt } = afterData;

      const mailOptions = {
        from: 'RSVP System <gayelabouimad@gmail.com>',
        to: NOTIFICATION_EMAILS.join(', '),
        subject: `📝 RSVP Updated: ${guestNamesDisplay}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #ff9800; margin-bottom: 20px;">📝 RSVP Updated</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Guest(s):</strong> ${guestNamesDisplay}</p>
              <p style="margin: 5px 0;"><strong>Attending:</strong> ${attending ? '✅ Yes' : '❌ No'}</p>
              ${attending ? `<p style="margin: 5px 0;"><strong>Number of Attendees:</strong> ${attendeeCount}</p>` : ''}
              ${message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${message}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Updated:</strong> ${new Date(updatedAt).toLocaleString()}</p>
            </div>
            
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Update email sent successfully for RSVP: ${guestNamesDisplay}`);
    } catch (error) {
      console.error('Error sending update email:', error);
    }
  }
);

