
---
description: Deploy Firestore Security Rules using Firebase CLI
---

## Overview

This workflow updates your Firestore Security Rules to secure your data.

### Prerequisites

1.  **Firebase CLI Installed**
    - Check with: `firebase --version`
    - If missing, install: `npm install -g firebase-tools`

2.  **Authenticated**
    - Run: `firebase login` (Follow browser prompts)

3.  **Project ID**
    - You need your Firebase Project ID (e.g., `brandlift-12345`).
    - Find it in Firebase Console > Project Settings > General.

### Deployment Command

Run the following command in your terminal, replacing `YOUR_PROJECT_ID` with your actual ID:

```bash
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```

### Verification

1.  Go to **Firebase Console** > **Firestore Database** > **Rules**.
2.  Refresh the page.
3.  You should see the rules updated to:
    ```
    allow read, write: if false; // for default
    allow read: if request.auth != null ... // for /clients
    ```
