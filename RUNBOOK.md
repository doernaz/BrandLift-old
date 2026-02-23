# BrandLift Command Center - Technical Runbook

## 1. Executive Summary
The **BrandLift Command Center** is an autonomous orchestration platform designed to identify local market opportunities ("Efficiency Vacuums"), analyze competitor weakness, and instantly provision superior digital infrastructure to capture market share.

The system leverages **Google Places API** for lead discovery, **Google Gemini** for semantic analysis and content generation, and **20i Reseller API** for automated infrastructure provisioning.

## 2. System Architecture

### 2.1 Core Components
| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React (Vite) + Tailwind | Interactive dashboard for executing protocols and viewing intelligence. |
| **Backend** | Firebase Functions (Node.js) | Serverless API handling orchestration, database operations, and external API calls. |
| **Database** | Firestore | Persists client data, logs, and "Vault" logic. |
| **AI Engine** | Google Gemini 1.5 Pro | Generates SEO strategies, visual concepts, and semantic content. |
| **Hosting** | 20i (StackStaging) | Target infrastructure for provisioned client sites. |

### 2.2 Critical Services
- **`antigravityService`**: The master orchestrator. Chains lead discovery, analysis, calculation, and provisioning into a single atomic operation.
- **`twentyiService`**: Handles all interactions with the 20i Reseller API (Provisioning, FTP, Security, SSO).
- **`deepScanService`**: Performs semantic analysis on target URLs to generate "Visual Concepts" and SEO strategies.
- **`vpsDeployService`**: *Experimental* module for VPS orchestration via SSH (Currently in development/blocked).

---

## 3. Operational Workflows & Logic

### 3.1 The Antigravity Protocol (Global Orchestration)
**Endpoint:** `POST /api/antigravity/execute`

This is the primary automated flow of the application.

1.  **Lead Discovery**:
    *   Queries Google Places API for businesses in the specified `Industry` and `Location`.
    *   **Efficiency Vacuum Filter**: Filters for businesses with **High Ratings (>15)** but **NO Website**.
    *   *Fallback*: If no "ideal" vacuum matches, selects the highest-rated operational business.

2.  **Competitive Intelligence**:
    *   Generates a market leaderboard (Speed/SEO scores) to establish a baseline.
    *   Calculates **Annual Revenue Lift** based on niche market values (e.g., HVAC = $5,500 ATV) and projected traffic capture.

3.  **Infrastructure Provisioning**:
    *   Calls `twentyiService.provisionSandbox`.
    *   Generates a sanitized domain string (e.g., `holland-hvac-scottsdale.stackstaging.com`).

### 3.1.1 Service Discovery & Enrichment Pipeline
**Source Code:** `services/enrichmentService.ts`

The system employs a multi-stage pipeline to gather comprehensive client intelligence:

**Stage 1: Primary Data (Google Places API)**
*   **Endpoint**: `places.googleapis.com/v1/places:searchText`
*   **Data Acquired**:
    *   Business Name & Address
    *   Phone Number (International format)
    *   Business Status (Operational/Closed)
    *   Social Proof: Rating, Review Count, Top 5 Reviews
    *   Official Website URI (if listed)

**Stage 2: Digital Footprint Recovery (Google Custom Search)**
*   **Trigger**: If `websiteUri` is missing from Stage 1.
*   **Action**: Executes a targeted SERP query: `official website [Business Name] [Address]`.
*   **Goal**: To find a website that Google Maps might have missed, or confirm digital destitution.

**Stage 3: Contact Enrichment (Hunter.io)**
*   **Trigger**: If a valid domain is found in Stage 1 or 2.
*   **Action**: Queries Hunter.io Domain Search API.
*   **Data Acquired**: Verified email addresses (prioritizing personal/high-confidence matches).
*   **Fallback**: If no API match, applies heuristic patterns (e.g., `contact@[domain].com`).

**Stage 4: Social Graph (Heuristic)**
*   **Action**: Generates probable social media profile links based on business name normalization protocols (e.g., `facebook.com/[clean-name]`).

**Stage 5: "Gold Mine" Filter (Internal Logic)**
*   **Criteria**:
    *   **NO Website** (Digital Vacuum)
    *   **Rating > 4.2** (High Trust)
    *   **Reviews > 15** (Established Volume)
*   **Result**: Flags the lead as a "High Value Target" for immediate automated provisioning.


### 3.2 20i Provisioning & Website Deployment (DETAILED)
**Service:** `functions/src/services/twentyiService.ts`

This workflow successfully provisions a working WordPress/HTML site on 20i's StackStaging platform.

**Step 1: Provisioning (`addWeb`)**
*   **API Call**: `POST https://api.20i.com/reseller/*/addWeb`
*   **Payload**:
    ```json
    {
      "type": "284869", // BrandLift Essential Package
      "domain_name": "client-domain.com",
      "password": "[Generated-Secure-String]"
    }
    ```
*   **Conflict Handling**: Checks for `409 Conflict`. If found, it attempts to DELETE the stale package or generate a fallback unique domain.

**Step 2: Propagation Wait**
*   The system pauses for **5 seconds** to allow 20i DNS/systems to propagate the new package.

**Step 3: Credential Confirmation**
*   The system calls `GET /package/{id}/web` to retrieve the **confirmed** FTP username (often different from the domain, e.g., `stack-user-123`).
*   It relies on the password generated in Step 1, or forces a password reset via `POST /package/{id}/web/ftp/password` if authentication fails.

**Step 4: FTP Deployment (`basic-ftp`)**
*   **Library**: `basic-ftp`
*   **Security**: Attempts to explicitly **UNLOCK** FTP via API before connecting.
*   **Connection**: Connects to `ftp.stackcp.com` using the confirmed credentials.
*   **Retry Logic**:
    *   If login fails (530), it triggers an automatic **Password Reset** and retries.
    *   Attempts up to 5 times.
*   **Upload**: Streams the generated HTML (or Blueprint) directly to `public_html/index.html`.

### 3.3 Deep Scan & Visual DNA
**Endpoint:** `POST /api/deep-scan`

1.  **Input**: Target Client URL + HTML Content.
2.  **Vault Logic**: Retrieves patented prompts from Firestore (`brandlift_ip_vault`).
3.  **AI Generation**:
    *   Role: "UI/UX Architect".
    *   Constraint: "Minimalist Tech" / "High Contrast".
    *   Output: JSON containing 3 distinct visual concepts (palettes, typography, hero imagery descriptions) and an SEO remediation plan.

---

## 4. API Reference

### 4.1 Orchestration
| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/api/antigravity/execute` | Run full protocol | `{ "industry": "HVAC", "location": "Phoenix" }` |
| `POST` | `/api/deep-scan` | Analyze site & gen concepts | `{ "url": "...", "htmlContent": "..." }` |

### 4.2 Deployment (20i)
| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/api/deploy/provision` | Create Sandbox | `{ "domain": "foo.com", "blueprintId": "123" }` |
| `POST` | `/api/deploy/variant` | Upload HTML to existing | `{ "packageId": "...", "variantHtml": "..." }` |
| `POST` | `/api/security/ftp` | Lock/Unlock FTP | `{ "packageId": "...", "action": "unlock" }` |
| `GET` | `/api/admin/packages` | List all 20i packages | - |

### 4.3 Payments
| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/api/payment/checkout` | Create Stripe Session | `{ "sandboxId": "...", "tier": "BASIC" }` |
| `POST` | `/api/payment/webhook` | Handle success -> Push Live | (Stripe Event) |

---

## 5. Configuration & Environment Variables

The application requires a `.env.local` (or Firebase Config) with the following keys. **Warning: These are live credentials.**

```env
# 20i Reseller Hosting
# Key Format: [API Key ID] + [API Hash]
TWENTYI_API_KEY="ce33d588481f9d540+c5c22e22e2c5c72a9"
TWENTYI_LATEST_PASSWORD="BrandLift4af2fa46c4515617!A1"

# Google Cloud / AI
# Used for Place Discovery and Gemini Generative AI
GEMINI_API_KEY="AIzaSyDqeUZluj3sMOaNksaiqHCpad4zgNJguiY"
VITE_GOOGLE_PLACES_API_KEY="AIzaSyDn69q2rhCD2IwG4GswtFGZYpyNJsVhxc4"
VITE_SEARCH_ENGINE_API_KEY="AIzaSyDn69q2rhCD2IwG4GswtFGZYpyNJsVhxc4"
VITE_SEARCH_ENGINE_ID="709108857a32f4dfa"

# Hunter.io (Email Verification)
VITE_HUNTER_API_KEY="bb57a094dcf4ecfb0787ded86cdb682d391298b7"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_51SzPnQKXUwEE4A3H4I9Vk6L6QS0Q0JI0dgBVWoijd4AqCt9KZbczZ1AmaD05047Iqi3nM7XFmrPveek8RlZgElv00CD4dP4pu"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_51SzPnQKXUwEE4A3ScdMGR8CvlwRYBuv5E26n6KySsD9TvcnFOdzWbHrEoKTBGXl82tSmtauj11ljitU5YjtgoZ00kBUkKNub"
# STRIPE_WEBHOOK_SECRET (Optional/Not currently set in env)

# Firebase Service Account
# Required for Admin SDK privileges in functions context
BRANDLIFT_SERVICE_ACCOUNT='{"type":"service_account","project_id":"brandlift-c5987","private_key_id":"87c1dca428db8f6d93ac74f229de4f8c9baec209","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCadf+BFA2GPxu+\n5GoSYiW6Wq21seP2/HJ7i0r0w8kLo/T8Hqw+h5OVnInkMC98Q/nmlOHUO9C02CJ1\nekkWc0Z7l2CYHh7tiXSqyRnRvwTDFRIpnPkQo/ICZj1/wwZ2WPyjZm4bulW3yPoT\nNCcKNzupoKH756sp9ksuvL0Mqhqvp/aPcbiThVs2QJ5wgDFxsLiqJ+UEVtMmzFlJ\nwWFV4LNdNno1ojpwiICO76Ba9pn+yquEBS3ZqBo6MilX8ryoZD+FLducvz74gl/6\njmDN3kgkPDa5vpiojSlhRSeWxI2Pq/jKzWSyGJX6z8/5tid35vBR/WDMer7fY/fu\n2YwlT/wlAgMBAAECggEAFQS1jgUCiiAQUHuYi4Pbim5IcQ8R7EwR8AnWW1RBCVp4\nPc6WtbORO6yffvOnootFeEEOMekpz1IR7laDl5B8KNlChbCjmMM5ovvWjZomtb0q\nSYtYwRDuH7F18OrC+FvHlRydIxzKCUZJ8U8JePRnI//9yt+NhRpExMleGFkVZI2K\neqE6Gf9kuDgRNQZvNVnNNl0jdp5771v218eQ3lPJgrbD1X3X2fFldtJiCCa3NeVc\n7HKT3eDLDOOgw3dyNTTGDWIwCmxmo1Ug6JB2lp/XAGZeezStQoaUXnymyfajLnaT\n2mocadTDaA6w/KGRZpmOx7BMErp+gENQHvwJoeZcyQKBgQDIvXHGpjpaesox3ILB\ngnwV5vRFaC0OUh5ndzVhT0RfCaBdCrmcjkxEPjk1HlmQpwgNK8EOahwB6otuzR0A\n5aDJDpQ0r78LlBW7aTzeN8CjcfEUAn7c+kyEYuesRcHH2s7eLgTMOPdNDYZq+T2U\ntaof1nKKHOVLwO1GOuy2A00kkwKBgQDE+ywwTHBqNY4m2T03GksCosD6CnP8lRHk\noAM55nDuO89Wg8qqoqT42ZZNFIS2Trrm3I6/1Or4ZjHZDAF7yP5GHi3KnlVtVCBH\nKsx0FlyikLm+Qc7nvRHFSTN6F9hP3ZNgvcvm15iqj6Ub4ODj0dN7MKVtXOTuEt8s\nRNQS/cjHZwKBgQCarCX7m1+BEfWzv6Xcdq8nrSHwTNnSnAGjVV4DEbGrzN4MctQb\nxiULvCoWPMFkTN9OTrVdZvMXouI2yMKdS1G9OYeGpRf+Uub/1ZG545mCFqxb76RS\nnmXQ5+h8e+9ZD8avuSOnPAmJDG/TAyKo7+UazQDKXINtAEWTBJoZkKejEwKBgG5b\nvkUM/koy2QJg4U/21iGS54TuyE6xgcXR9BzDQ2/laGMzER+KYdzdorxqi3PMJiBj\nX0KQWlhygOj2NfqRAAxuqf8DuB65bCATFVrQkHOvm7DBE9d3cPZT7ZgwtcsA+6nO\ni+c30Nt2AO3ejoB0tQQmm/fqfIP5ZLlbkmlVb+BvAoGABsytI2mYF+yuv2xr0lSV\naKrdM0A4wbAEkTTulZYKTwYXsU9HJYMjceDpXd8lfwNOa7j7clfs3bH0kbZDvCdV\nesVHScJpW0W/WjJ1Cf4S1L33asOyoYCvPPloAHThy5kv0/cSXCgfspB5iSyT7n3O\nqzjcyqTVBotn+45vGHKHVwU=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@brandlift-c5987.iam.gserviceaccount.com","client_id":"114026659188208238179","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40brandlift-c5987.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'

# VPS / Infrastructure (Experimental)
VPS_HOST="185.146.166.214"
VPS_USER="root"
VPS_PASS="fe3caaa8e4"
SANDBOX_DOMAIN="brandlift.ai"
```

**Note on 20i Key**: The system handles the required Base64 encoding for `TWENTYI_API_KEY` internally.

## 6. Cost Analysis (Per Execution)

The following table breaks down the marginal cost of a single "Antigravity" run (Discovery -> Analysis -> Provisioning).

| Service | Operation | Unit Cost | Est. Cost / Run |
| :--- | :--- | :--- | :--- |
| **Google Places API** | New Text Search (Field Masked) | ~$32.00 / 1k requests | **$0.032** |
| **Google Gemini AI** | `gemini-flash-latest` Analysis | $0.0003 / 1k tokens | **<$0.001** |
| **Google Custom Search** | Site verification | $5.00 / 1k (100 free/day) | **$0.00** |
| **20i Hosting** | `provisionSandbox` (StackStaging) | Included in Reseller Sub | **$0.00** |
| **Total** | | | **~$0.035** |

*Note: Deployment scale is effectively limited only by the Google Places API budget.*

## 7. Known Issues & Troubleshooting

### 6.1 FTP Deploy Fails (Timeout / 530 Login Incorrect)
*   **Cause**: 20i Security Lock or Propagation Delay.
*   **System Fix**: The `twentyiService` automatically retries and forces a password reset.
*   **Manual Fix**: Log into 20i Control Panel, find the package, and toggle "Unlock FTP".

### 6.2 "No route handler for /addVps"
*   **Cause**: The current 20i Reseller Tier (`33267`) does not have access to the VPS/Cloud provisioning endpoints.
*   **Status**: VPS Deployment is currently **BLOCKED**. Use the `provisionSandbox` (StackStaging) flow instead, which is fully operational.

### 6.3 "Efficiency Vacuum" Returns No Results
*   **Cause**: Every highly-rated business in the target area already has a website.
*   **System Behavior**: The system falls back to the highest-rated Operational business to ensure the demo continues.
