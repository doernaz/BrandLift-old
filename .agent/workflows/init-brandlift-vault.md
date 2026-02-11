
---
description: Initialize the BrandLift Intellectual Property Vault
---

## Overview

This workflow initializes the **BrandLift IP Vault**, a secure Firebase collection for storing proprietary algorithms, logic, and heuristics used by the platform.

### Prerequisites

- You must have a **Firebase Service Account Key** in your `.env.local` file.
  - Variable Name: `FIREBASE_SERVICE_ACCOUNT`
  - Format: JSON string or object
  - Permissions: Read/Write to Cloud Firestore

### Steps

1.  **Check for existing Vault Configuration**
    Ensure that `FIREBASE_SERVICE_ACCOUNT` is set in `.env.local`.

2.  **Run Initialization Script**
    Execute the following command to create and populate the Vault with default IP:
    
// turbo
    `npx tsx scripts/init-vault.ts`

3.  **Verify Setup**
    Check the terminal output for success messages.
    If successful, you can now access the Vault logic via `firebaseService.getPatentedLogic()`.

### Troubleshooting

- **Error: FIREBASE_SERVICE_ACCOUNT not found**:
  - Download your Service Account Key from Firebase Console > Project Settings > Service Accounts.
  - Add it to `.env.local` as `FIREBASE_SERVICE_ACCOUNT='{...}'`.
  
- **Error: initializing Vault**:
  - Check your internet connection.
  - Ensure the Service Account has `Cloud Datastore User` or `Admin` roles.
