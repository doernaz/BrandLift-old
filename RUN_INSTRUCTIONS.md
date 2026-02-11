# BrandLift Command Center - Setup & Run Instructions

## Prerequisites
- Node.js (v18+)
- Stripe Account (optional for dev, required for payments)
- Firebase Project (optional for dev, required for persistence)
- 20i Reseller Account (optional for dev, required for deployment)
- Google Gemini API Key (Required for AI features)

## 1. Environment Configuration

Create a file named `.env.local` in the root directory if it doesn't exist. You can copy the structure below:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_key_here

# 20i Reseller Configuration (Deployment)
TWENTYI_API_KEY=your_20i_key_here

# Stripe Configuration (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Stripe Price IDs (Optional - defaults to auto-generated mocks if missing)
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Firebase Configuration (Persistence)
# If using a service account file, place 'brandlift-service-account.json' in root
# OR paste the JSON content here:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Third Party APIs
GOOGLE_PLACES_API_KEY=your_places_key
SMTP_HOST=smtp.example.com
```

## 2. Installation

Install all dependencies:

```bash
npm install
```

## 3. Running the Application

This is a full-stack application (Vite Frontend + Express Backend). Use the following command to run both concurrently:

```bash
npm run dev:full
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 4. Feature Verification

### Deep Scan & SEO
- Navigate to the **SEO** module.
- Enter a URL (e.g., `stayinsedona.com`).
- The system will use Gemini to analyze and generate 3 strategic variants.

### Subsite Builder
- After a scan, click **"Build Client Subsite"**.
- This opens the `SubsiteBuilder`, allowing you to visualize the generated landing pages and export them.

### Pricing & Addons
- On the **Dashboard**, interact with the **Pricing Configurator** and **Addon Manager**.
- These communicate with the Stripe mock service (or real Stripe if keys provided).

### Blueprints & Deployment
- Use **Blueprint Manager** on the Dashboard to define site architectures.
- Click "Initiate Deployment" to simulate (or perform) a 20i StackStaging provision.

## 5. Troubleshooting

- **Proxy Errors**: Ensure the backend is running on port 3001. Check terminal for `Server running at ...`.
- **API Errors**: Check the browser console and server terminal logs. Most errors are due to missing API keys in `.env.local`.
- **Firebase**: If no credentials are found, the system falls back to an in-memory mock database. Data will reset on restart.
