# Multi-Environment Firebase Deployment Guide

## Current Setup Overview
- **App Hosting**: Firebase App Hosting (configured in `firebase.json`)
- **Database**: Firestore
- **Backend**: Cloud Functions
- **Project**: g-invitation-6e173

---

## Option 1: Firebase Project Aliases (RECOMMENDED)

### What is it?
Use different Firebase projects for different environments without code changes.

### Setup Steps

#### 1. Create a new Firebase project for staging/production
```bash
# Via Firebase Console:
# 1. Go to Google Cloud Console
# 2. Create new project (e.g., "g-invitation-staging")
# 3. Enable Firestore, Functions, and App Hosting in that project
```

#### 2. Update `.firebaserc` (DONE ✅)
Already updated to support aliases:
```json
{
  "projects": {
    "default": "g-invitation-6e173",
    "production": "g-invitation-6e173",
    "staging": "g-invitation-staging"
  }
}
```

#### 3. Deploy to specific project
```bash
# Deploy to production (default)
npm run deploy

# Or explicitly specify:
firebase deploy --project production

# Deploy to staging
firebase deploy --project staging

# Deploy only App Hosting to staging
firebase deploy --only apphosting --project staging

# Deploy only Functions to staging
firebase deploy --only functions --project staging

# Deploy only Firestore rules to staging
firebase deploy --only firestore:rules --project staging
```

#### 4. Get different hosting URLs
- **Production**: Automatically assigned (check `firebase.json` backendId or Firebase Console)
- **Staging**: Separate URL for staging project

---

## Option 2: Environment-Specific Configurations

If you need different code behavior per environment, create environment files:

### Create Environment Files

**`g-invitation/src/environments/environment.ts`** (Development)
```typescript
export const environment = {
  production: false,
  projectId: 'g-invitation-6e173',
  firestorePath: 'rsvp-elia-gayel',
  apiEndpoint: 'http://localhost:4000'
};
```

**`g-invitation/src/environments/environment.prod.ts`** (Production)
```typescript
export const environment = {
  production: true,
  projectId: 'g-invitation-6e173',
  firestorePath: 'rsvp-elia-gayel',
  apiEndpoint: 'https://g-invitation-prod.firebaseapp.com'
};
```

**`g-invitation/src/environments/environment.staging.ts`** (Staging)
```typescript
export const environment = {
  production: false,
  projectId: 'g-invitation-staging',
  firestorePath: 'rsvp-elia-gayel', // or different collection
  apiEndpoint: 'https://g-invitation-staging.firebaseapp.com'
};
```

### Update `angular.json` to use environments
```json
"configurations": {
  "production": {
    "outputHashing": "all",
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  },
  "staging": {
    "outputHashing": "all",
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.staging.ts"
      }
    ]
  }
}
```

### Build for different environments
```bash
# Build for production
ng build --configuration production

# Build for staging
ng build --configuration staging
```

---

## Option 3: Environment Variables (Recommended for Functions)

### Update Cloud Functions for different databases

**`functions/index.js`**
```javascript
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

// Get Firestore collection path from environment or use default
const COLLECTION_PATH = process.env.FIRESTORE_COLLECTION || 'rsvp-elia-gayel';

exports.sendRsvpCreatedEmail = onDocumentCreated(
  `${COLLECTION_PATH}/{documentId}`,
  async (event) => {
    // ... rest of code
  }
);
```

### Deploy with environment variables
```bash
# Deploy to staging with custom collection
firebase deploy --only functions --project staging -- FIRESTORE_COLLECTION=rsvp-staging

# Or set in .runtimeconfig.json for specific project
firebase functions:config:set env.firestore_collection="rsvp-staging" --project staging
```

---

## Option 4: Separate `firebase.json` per environment

Create environment-specific Firebase configs:

**`firebase.production.json`**
```json
{
  "apphosting": [
    {
      "backendId": "g-invitation-prod-app",
      "rootDir": "g-invitation",
      "runConfig": { "minInstances": 2 }
    }
  ],
  "firestore": { "rules": "firestore.rules" },
  "functions": { "source": "functions" }
}
```

**`firebase.staging.json`**
```json
{
  "apphosting": [
    {
      "backendId": "g-invitation-staging-app",
      "rootDir": "g-invitation",
      "runConfig": { "minInstances": 1 }
    }
  ],
  "firestore": { "rules": "firestore.rules" },
  "functions": { "source": "functions" }
}
```

### Deploy with specific config
```bash
firebase deploy -c firebase.production.json --project production
firebase deploy -c firebase.staging.json --project staging
```

---

## Deployment Workflow Comparison

| Aspect | Option 1 (Aliases) | Option 2 (Env Files) | Option 3 (Env Vars) | Option 4 (Config Files) |
|--------|-------------------|-------------------|-------------------|----------------------|
| Complexity | ⭐⭐ Simple | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Complex |
| Different Database | ✅ Full Support | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| Different Hosting URL | ✅ Automatic | ✅ Per-config | ❌ Same URL | ✅ Per-config |
| Code Changes | ❌ None | ✅ Build-time | ✅ Runtime | ✅ Build-time |
| Recommended | ✅✅✅ YES | ✅ For code variations | ✅ For Functions | ❌ Avoid |

---

## Quick Start: Deploy to Staging

### Step 1: Create Firebase project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project"
3. Name it `g-invitation-staging`
4. Create project

### Step 2: Verify project alias is set
```bash
cat .firebaserc
# Should show:
# "staging": "g-invitation-staging"
```

### Step 3: Deploy to staging
```bash
# Deploy everything to staging
firebase deploy --project staging

# Or just app hosting
firebase deploy --only apphosting --project staging
```

### Step 4: Get staging URL
```bash
firebase hosting:channel:list --project staging
# Or check Firebase Console > Hosting
```

---

## Command Reference

```bash
# List all projects configured
firebase projects:list

# Add new project alias
firebase use --add

# Switch to staging
firebase use staging

# Deploy to staging (after switching with "use")
firebase deploy

# Deploy specific services
firebase deploy --only apphosting --project staging
firebase deploy --only functions --project staging
firebase deploy --only firestore:rules --project staging

# Rollback
firebase deploy:rollback --project staging

# Monitor logs
firebase functions:log --project staging
firebase functions:log --project staging --limit 50
```

---

## Summary: Recommended Approach

1. **Use Option 1 (Aliases)** for different Firebase projects
2. **Use Option 2 (Env Files)** if your app code needs to know the environment
3. **Use Option 3 (Env Vars)** for Cloud Functions configuration
4. **Combine all three** for maximum flexibility

Your next steps:
1. ✅ `.firebaserc` updated with staging alias
2. ⏭️  Create new Firebase project for staging
3. ⏭️  Test deployment: `firebase deploy --project staging`
4. ⏭️  (Optional) Add environment files for code-level variations

