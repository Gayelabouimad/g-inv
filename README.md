# G Invitation

A modern, mobile-first digital wedding invitation web application built with Next.js 14+, TypeScript, and Tailwind CSS. This is a reusable framework that allows you to easily customize and deploy for multiple wedding events.

## Features

- 📱 **Mobile-first design** - Elegant and responsive across all devices
- 🎬 **Opening screen** - "Tap to start" experience with smooth transitions
- ⏱️ **Countdown timer** - Live countdown to the wedding day
- 💒 **Event sections** - Gathering, Ceremony, and Reception details with map links
- 📸 **Timeline section** - Wedding day timeline image
- 🎁 **Gift registry** - Configurable registry with account details
- ✅ **RSVP system** - Personalized RSVP form with Firebase storage
- 👤 **Personalized routes** - Each guest gets their own unique invitation link
- 🔗 **Admin panel** - Preview all invitation links in one place
- 🌐 **Add to calendar** - Google Calendar integration for events

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your Firebase configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Editing Event Details

Edit `data/event.json` to customize your wedding event:

```json
{
  "eventSlug": "your-event-slug",
  "couple": {
    "titleLine": "Are getting married",
    "primaryNames": "Name1 & Name2"
  },
  "date": "2026-08-16T17:30:00+03:00",
  "countdownTarget": "2026-08-16T17:30:00+03:00",
  "quote": "Your favorite quote",
  "quoteSource": "Quote source",
  "families": ["Family 1", "Family 2"],
  "introText": "Invitation text",
  "sections": {
    "gathering": { "enabled": true, ... },
    "ceremony": { "enabled": true, ... },
    "reception": { "enabled": true, ... },
    "timeline": { "enabled": true, ... },
    "registry": { "enabled": true, ... }
  },
  "rsvp": {
    "enabled": true,
    "deadlineText": "RSVP deadline text",
    "maxMessageLength": 120
  },
  "branding": {
    "backgroundImage": "/assets/background.jpg",
    "overlayOpacity": 0.45,
    "accentColor": "#d6c3a5",
    "textColor": "#ffffff"
  }
}
```

### Adding Guests

Edit `data/invitees.json` to add your guests:

```json
[
  {
    "id": "unique-id",
    "guestNames": ["Guest 1", "Guest 2"],
    "numberOfPeople": 2,
    "routeSlug": "guest-unique-slug",
    "accessToken": "guest_001"
  }
]
```

### Changing Background Image

1. Place your background image in `public/assets/background.jpg`
2. Update the `branding.backgroundImage` path in `data/event.json`

```json
{
  "branding": {
    "backgroundImage": "/assets/your-image.jpg"
  }
}
```

## Routing

- **Main invitation**: `http://localhost:3000/[eventSlug]/[routeSlug]`
- **Query param fallback**: `http://localhost:3000/[eventSlug]?gn=Name1,Name2&np=2`
- **Admin preview**: `http://localhost:3000/admin/preview`
- **Preview mode** (no RSVP): Add `?preview=1` to any invitation URL

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── [eventSlug]/       # Event dynamic route
│   │   └── [routeSlug]/   # Invitation page
│   ├── admin/preview/    # Admin preview page
│   └── api/rsvp/         # RSVP submission API
├── components/            # React components
│   ├── OpeningScreen.tsx
│   ├── CountdownSection.tsx
│   ├── IntroSection.tsx
│   ├── EventSection.tsx
│   ├── TimelineSection.tsx
│   ├── RegistrySection.tsx
│   ├── RSVPSection.tsx
│   └── ...
├── data/                 # JSON data files
│   ├── event.json
│   └── invitees.json
├── lib/                  # Utility functions
│   ├── firebase/         # Firebase configuration
│   └── utils/            # Helper functions
├── public/assets/        # Static assets
│   └── background.jpg
└── types/               # TypeScript definitions
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Add a web app to get your config
5. Generate a service account key for admin access:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Copy the contents to `FIREBASE_PRIVATE_KEY` in `.env.local`

### Firestore Rules

For development, you can use these rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{rsvp} {
      allow read: if false;
      allow write: if true;
    }
  }
}
```

For production, consider adding more secure rules.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Customization

### Colors

Edit `tailwind.config.ts` to customize theme colors:

```typescript
theme: {
  extend: {
    colors: {
      accent: '#d6c3a5',
      'accent-dark': '#b8a88a',
    },
  },
},
```

### Fonts

The default fonts are:
- Serif: Georgia, Cambria, Times New Roman
- Sans: system-ui, -apple-system, BlinkMacSystemFont

To use custom fonts, add them to `app/layout.tsx` using `next/font`.

## Troubleshooting

### Module not found errors



Make sure you've run `npm install` to install all dependencies.

### Firebase connection issues

- Check that your `.env.local` file is properly configured
- Verify your Firebase project has Firestore enabled
- Make sure your domain is authorized in Firebase Console

### RSVP not submitting

- Check browser console for errors
- Verify Firebase Admin credentials are correct
- Ensure Firestore has write permissions

## License

MIT License - Feel free to use this for your own wedding!

