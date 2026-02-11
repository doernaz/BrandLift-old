
# BrandLift Infrastructure Deployment Guide

## Overview
This document outlines the deployment of the newly orchestrated platform components:
1.  **Source of Truth**: Firebase (Clients, Configs, Logs)
2.  **Hosting**: 20i Reseller API (Provisioning, Chatbots)
3.  **Financials**: Stripe (Checkout, Metrics)
4.  **UI**: Monitor & Analytics Dashboards

## 1. Environment Configuration (.env.local)
Add the following keys to your `.env.local` to activate the services:

```env
# 20i Reseller API (Provisioning)
TWENTYI_API_KEY=your_20i_api_token_here

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLAN_PRICE_ID=price_...

# Firebase (Data)
# Provide the JSON content of your service account key file
FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", "project_id": "...", ...}'
```

## 2. Service Verification

### Zero-Touch Deployment
- **Endpoint**: `POST /api/deploy/provision`
- **Logic**: Calls 20i `addWeb` API using the Master Blueprint ID.
- **Output**: Returns a Sandbox URL (e.g., `client-site.stackstaging.com`).

### Financial Gate
- **Endpoint**: `POST /api/payment/checkout`
- **Logic**: Creates a Stripe Session linked to the Sandbox ID.
- **FTP Unlocking**: The deployment script attempts to unlock FTP via the `POST /package/{id}/web/ftp/unlock` endpoint using the public IP (resolved via `api.ipify.org`). If this fails or your IP changes, you may see `530 Login incorrect` errors.
  - **Manual Fix**: Log into My20i -> Manage Hosting -> [Package] -> Unlock FTP.
- **Propagation**: New packages may take 1-5 minutes before FTP credentials become active. The script retries for ~60 seconds.
- **Trigger**: Upon payment success, Stripe webhook calls `/api/payment/webhook`.

### Promotion & Injection
- **Logic**: The webhook handler:
    1. Updates Firebase status to `live`.
    2. Injects the Chatbot script + Patent Notice via 20i `wp-settings`.
    3. Generates an SSO link for client hand-off.

## 3. Dashboard Access

- **Database Explorer**: Navigate to the `Monitor` module in the app.
    - View active clients and system logs mirrored from Firebase.
- **Profit Metrics**: Navigate to the `Analytics` module.
    - View real-time Gross Revenue, Net Profit, and OpEx breakdown.

## 4. Legal Compliance
The infrastructure automatically injects the following footer script into all provisioned sites:
`Patented Infrastructure: brandlift.ai/patents`

## 5. Development
Restart the backend server to apply changes:
```bash
# Stop the running server (Ctrl+C)
npx tsx server.ts
```
