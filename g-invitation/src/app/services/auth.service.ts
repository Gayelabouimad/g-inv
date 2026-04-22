import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

const firebaseConfig = {
  apiKey: 'AIzaSyCzRQCwGXAyXW_ej-LbBpR_yc8xD3Xkigo',
  authDomain: 'g-invitation-6e173.firebaseapp.com',
  projectId: 'g-invitation-6e173',
  storageBucket: 'g-invitation-6e173.firebasestorage.app',
  messagingSenderId: '289964033553',
  appId: '1:289964033553:web:0bd883f2b94019063113b0',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null | undefined>(undefined);
  private auth: Auth | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const auth = this.getAuthInstance();

      void setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Failed to configure auth persistence:', error);
      });

      onAuthStateChanged(auth, (user) => {
        this.currentUser$.next(user);
      });
    }
  }

  private getAuthInstance(): Auth {
    if (typeof window === 'undefined') {
      throw new Error('Authentication is only available in the browser.');
    }

    if (!this.auth) {
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      this.auth = getAuth(app);
    }

    return this.auth;
  }

  get currentUser() {
    return this.currentUser$.asObservable();
  }

  get currentUserValue() {
    return this.currentUser$.value;
  }

  async login(email: string, password: string): Promise<void> {
    const auth = this.getAuthInstance();
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    const auth = this.getAuthInstance();
    await signOut(auth);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }
}

