# Multi-Environment Deployment Quick Reference

## Available npm Scripts

### Deployment to Production
```bash
npm run deploy:prod              # Deploy everything to production
npm run deploy:apphosting:prod   # Deploy only app hosting to production
npm run deploy:functions:prod    # Deploy only functions to production
npm run deploy:firestore:prod    # Deploy only firestore rules to production
```

### Deployment to Staging
```bash
npm run deploy:staging              # Deploy everything to staging
npm run deploy:apphosting:staging   # Deploy only app hosting to staging
npm run deploy:functions:staging    # Deploy only functions to staging
npm run deploy:firestore:staging    # Deploy only firestore rules to staging
```

### Switch Between Projects
```bash
npm run use:prod      # Set production as default
npm run use:staging   # Set staging as default
```

### Generic Deployment (uses default project)
```bash
npm run deploy                  # Deploy everything to default project
npm run deploy:apphosting       # Deploy only app hosting
npm run deploy:functions        # Deploy only functions
npm run deploy:firestore        # Deploy only firestore rules
```

---

## Setup Instructions

### 1. Create Staging Firebase Project

Visit [Firebase Console](https://console.firebase.google.com/):
1. Create new project named `g-invitation-staging`
2. Enable these services:
   - ✅ Firestore Database
   - ✅ Cloud Functions
   - ✅ App Hosting
3. Note the Project ID: `g-invitation-staging`

### 2. Verify `.firebaserc` Configuration

Your `.firebaserc` should contain both projects:
```json
{
  "projects": {
    "default": "g-invitation-6e173",
    "production": "g-invitation-6e173",
    "staging": "g-invitation-staging"
  }
}
```

### 3. First Deployment to Staging

```bash
# Set up App Hosting in staging project
npm run deploy:apphosting:staging

# Deploy Firestore rules
npm run deploy:firestore:staging

# Deploy Cloud Functions
npm run deploy:functions:staging

# Or deploy everything at once
npm run deploy:staging
```

### 4. Get Your Staging URL

After deployment completes, run:
```bash
firebase hosting:channel:list --project staging
```

Or check Firebase Console:
- Firebase Console → Select `g-invitation-staging` project
- App Hosting → View your backend URL

---

## Common Workflows

### Deploy Code Changes to Production
```bash
npm run web:build           # Build the Angular app
npm run deploy:apphosting:prod  # Deploy to production hosting
```

### Deploy Functions Changes to Staging
```bash
npm run deploy:functions:staging
```

### Deploy Firestore Rules Changes to Both
```bash
npm run deploy:firestore:prod
npm run deploy:firestore:staging
```

### Full Production Release (Everything)
```bash
npm run web:build
npm run deploy:prod
```

### Full Staging Release (Everything)
```bash
npm run web:build
npm run deploy:staging
```

---

## Environment-Specific Database Configuration

### Current Setup
- **Production Database**: `g-invitation-6e173`
- **Staging Database**: `g-invitation-staging`

### Switching Between Databases

If you need your Cloud Functions to use different Firestore paths per environment, 
see `DEPLOYMENT_GUIDE.md` for Options 3 & 4 (Environment Variables & Config Files).

---

## Troubleshooting

### Error: "Project not found"
```bash
# Verify your projects are configured
firebase projects:list

# Re-add if needed
firebase use --add
```

### Error: "Insufficient permissions"
```bash
# Ensure you're logged in to the correct Google account
firebase logout
firebase login

# Verify project access
firebase use production
firebase projects:list
```

### View Staging Deployment Logs
```bash
firebase functions:log --project staging
firebase hosting:channel:list --project staging
```

---

## Costs & Best Practices

### Firebase Pricing Considerations
- **Firestore**: Pay-per-read/write (staging environment will have its own usage)
- **Cloud Functions**: Pay-per-execution (each project billed separately)
- **App Hosting**: Similar to Firebase Hosting (per project)

### Recommended Setup
- **Production**: Use `g-invitation-6e173` for real events
- **Staging**: Use `g-invitation-staging` for testing before production

### Minimize Staging Costs
1. Set function memory lower in staging (if using Cloud Functions)
2. Use firestore rules to restrict writes in staging
3. Archive old test data regularly
4. Consider pausing App Hosting when not testing

---

## See Also
- `DEPLOYMENT_GUIDE.md` - Detailed explanation of all deployment options
- `.firebaserc` - Project configuration file
- `firebase.json` - Firebase service configuration

