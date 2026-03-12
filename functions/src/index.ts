import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface RsvpData {
  message: string;
  attendeeCount: number;
  attending: boolean;
  guestNamesDisplay: boolean;
  inviteeId: string;
  accessToken: string;
  eventSlug: string;
  guestNames: [];
  allowedPeople: number;
}

interface RsvpResponse {
  valid: boolean;
  errors?: string[];
}

// Validation function
// eslint-disable-next-line require-jsdoc
function validateRSVPData(data: RsvpData): RsvpResponse {
  const errors: string[] = [];

  if (!data.inviteeId) {
    errors.push("Invalid invitee ID");
  }
  if (!data.accessToken) {
    errors.push("Invalid access token");
  }
  if (!data.eventSlug) {
    errors.push("Invalid event slug");
  }
  if (!Array.isArray(data.guestNames) || data.guestNames.length === 0) {
    errors.push("At least one guest name is required");
  }
  if (!data.guestNamesDisplay) {
    errors.push("Guest names display is required");
  }
  if (data.allowedPeople < 1) {
    errors.push("Invalid allowed people count");
  }
  if (!data.attending) {
    errors.push("Attendance status is required");
  }
  if (data.attendeeCount < 0) {
    errors.push("Invalid attendee count");
  }
  if (data.message && data.message.length > 120) {
    errors.push("Message cannot exceed 120 characters");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// RSVP submission Cloud Function
export const submitRsvp = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({error: "Method not allowed"});
    return;
  }

  try {
    const data = req.body;

    // Validate request data
    const validation = validateRSVPData(data);
    if (!validation.valid) {
      res.status(400).json({
        error: "Invalid form data",
        details: validation.errors,
      });
      return;
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Check for existing RSVP by this invitee
    const existingRsvp = await db
      .collection("rsvps")
      .where("inviteeId", "==", data.inviteeId)
      .where("eventSlug", "==", data.eventSlug)
      .limit(1)
      .get();

    if (!existingRsvp.empty) {
      const existingDoc = existingRsvp.docs[0];
      const existingData = existingDoc.data();

      // If already submitted, reject
      if (existingData.attending !== null &&
          existingData.attending !== undefined) {
        res.status(409).json({
          error: "You have already submitted an RSVP",
          existingRsvp: {
            attending: existingData.attending,
            attendeeCount: existingData.attendeeCount,
          },
        });
        return;
      }
    }

    // Prepare RSVP document
    const rsvpDoc = {
      inviteeId: data.inviteeId,
      accessToken: data.accessToken,
      eventSlug: data.eventSlug,
      guestNames: data.guestNames,
      guestNamesDisplay: data.guestNamesDisplay,
      allowedPeople: data.allowedPeople,
      attending: data.attending,
      attendeeCount: data.attending ? data.attendeeCount : 0,
      message: data.message || "",
      submittedFromRoute: data.submittedFromRoute,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    } as RsvpData;

    // Save to Firestore
    if (!existingRsvp.empty) {
      await existingRsvp.docs[0].ref.update({
        ...rsvpDoc,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection("rsvps").add(rsvpDoc);
    }

    res.status(200).json({
      success: true,
      message: "RSVP submitted successfully",
    });
  } catch (error) {
    console.error("RSVP submission error:", error);
    res.status(500).json({
      error: "Failed to submit RSVP. Please try again.",
    });
  }
});

