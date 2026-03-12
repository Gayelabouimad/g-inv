import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { RSVPSubmission } from '../models/invitation.models';

const firebaseConfig = {
  apiKey: 'AIzaSyCzRQCwGXAyXW_ej-LbBpR_yc8xD3Xkigo',
  authDomain: 'g-invitation-6e173.firebaseapp.com',
  projectId: 'g-invitation-6e173',
  storageBucket: 'g-invitation-6e173.firebasestorage.app',
  messagingSenderId: '289964033553',
  appId: '1:289964033553:web:0bd883f2b94019063113b0',
};

@Injectable({ providedIn: 'root' })
export class RsvpService {
  private initialized = false;

  private ensureInitialized(): void {
    if (typeof window === 'undefined') {
      throw new Error('RSVP submission is only available in the browser.');
    }
    if (!this.initialized) {
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
      this.initialized = true;
    }
  }

  /**
   * Get the collection name for a specific event
   * @param eventSlug The event slug (e.g., 'g-invitation')
   * @returns The collection name (e.g., 'rsvp-g-invitation')
   */
  private getCollectionName(eventSlug: string): string {
    return `rsvp-${eventSlug}`;
  }

  /**
   * Read existing RSVP response for a specific invitee
   * @param inviteeId The invitee ID
   * @param eventSlug The event slug
   * @returns The RSVP submission if found, null otherwise
   */
  async read(inviteeId: string, eventSlug: string): Promise<RSVPSubmission | null> {
    this.ensureInitialized();

    const db = getFirestore();
    const collectionName = this.getCollectionName(eventSlug);
    const rsvps = collection(db, collectionName);

    const existing = await getDocs(
      query(rsvps, where('inviteeId', '==', inviteeId), limit(1)),
    );

    if (existing.empty) {
      return null;
    }

    return existing.docs[0].data() as RSVPSubmission;
  }

  /**
   * Submit or update RSVP response
   * @param payload The RSVP submission data
   */
  async submit(payload: RSVPSubmission): Promise<void> {
    this.ensureInitialized();

    const db = getFirestore();
    const collectionName = this.getCollectionName(payload.eventSlug);
    const rsvps = collection(db, collectionName);

    const existing = await getDocs(
      query(rsvps, where('inviteeId', '==', payload.inviteeId), limit(1)),
    );

    const now = new Date().toISOString();
    const docPayload = {
      ...payload,
      attendeeCount: payload.attending ? payload.attendeeCount : 0,
      message: payload.message ?? '',
      updatedAt: now,
    };

    if (!existing.empty) {
      const ref = existing.docs[0].ref;
      await updateDoc(ref, docPayload);
      return;
    }

    await addDoc(rsvps, { ...docPayload, createdAt: now });
  }

  /**
   * Delete an existing RSVP response for a specific invitee.
   * If no response exists, this is a no-op.
   */
  async delete(inviteeId: string, eventSlug: string): Promise<void> {
    this.ensureInitialized();

    const db = getFirestore();
    const collectionName = this.getCollectionName(eventSlug);
    const rsvps = collection(db, collectionName);

    const existing = await getDocs(
      query(rsvps, where('inviteeId', '==', inviteeId), limit(1)),
    );

    if (existing.empty) {
      return;
    }

    await deleteDoc(existing.docs[0].ref);
  }
}


