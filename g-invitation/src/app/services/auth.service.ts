import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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

  constructor() {
    if (typeof window !== 'undefined') {
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        this.currentUser$.next(user);
      });
    } else {
      // SSR: no auth available, treat as logged out
      this.currentUser$.next(null);
    }
  }

  get currentUser() {
    return this.currentUser$.asObservable();
  }

  get currentUserValue() {
    return this.currentUser$.value;
  }

  async login(email: string, password: string): Promise<void> {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await signOut(auth);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }
}

