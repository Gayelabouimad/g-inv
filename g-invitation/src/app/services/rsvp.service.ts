import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
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

  async submit(payload: RSVPSubmission): Promise<void> {
    this.ensureInitialized();

    const db = getFirestore();
    const rsvps = collection(db, 'rsvps');
    const existing = await getDocs(
      query(
        rsvps,
        where('inviteeId', '==', payload.inviteeId),
        where('eventSlug', '==', payload.eventSlug),
        limit(1),
      ),
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
}


