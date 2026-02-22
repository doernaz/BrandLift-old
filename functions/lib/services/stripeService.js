"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.PRICING_TIERS = void 0;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
// Initialize Stripe Client
const stripeClient = process.env.STRIPE_SECRET_KEY
    ? new stripe_1.default(process.env.STRIPE_SECRET_KEY)
    : null;
// BrandLift Tiered Pricing Strategy
// Base Model: Hybrid Support ($180/month) + Feature Tiers
exports.PRICING_TIERS = {
    BASIC: {
        id: 'price_basic_tier',
        name: 'BrandLift Basic',
        amount: 18000, // $180.00
        description: 'Core SEO + Hybrid Support',
        features: ['Weekly SEO Scan', 'Email Support', 'Shared Hosting']
    },
    PRO: {
        id: 'price_pro_tier',
        name: 'BrandLift Pro',
        amount: 35000, // $350.00
        description: 'Deep Scan AI + Priority Support',
        features: ['Daily SEO Scan', 'Slack Support', 'Dedicated VPS', 'Content Gen v1']
    },
    ENTERPRISE: {
        id: 'price_ent_tier',
        name: 'BrandLift Enterprise',
        amount: 90000, // $900.00
        description: 'Full Autonomy + Franchise Scale',
        features: ['Real-time SEO', 'Dedicated Account Mgr', 'Multi-site Orchestration', 'Market Analysis v1']
    }
};
exports.stripeService = {
    /**
     * Create Checkout Session for Client Access (Financial Gate)
     * This links the temporary sandbox to a premium package purchase.
     */
    async createCheckoutSession(sandboxId, email, tier = 'BASIC', addons = []) {
        // Resolve Tier Price ID (Real or Mock)
        const selectedTier = exports.PRICING_TIERS[tier];
        const basePriceId = process.env[`STRIPE_PRICE_${tier}`] || selectedTier.id; // Use Env ID if available, else mock/fallback
        if (!stripeClient) {
            console.log(`[MOCK] Checkout: ${email} | Tier: ${tier} ($${selectedTier.amount / 100}) | Sandbox: ${sandboxId}`);
            return {
                url: `https://brandlift.ai/mock-checkout?tier=${tier}&sandbox=${sandboxId}`,
                sessionId: `sess_mock_${Date.now()}`
            };
        }
        try {
            // Construct Line Items: Base Tier + Addons
            const lineItems = [
                {
                    price: basePriceId,
                    quantity: 1,
                },
                ...addons
            ];
            const session = await stripeClient.checkout.sessions.create({
                line_items: lineItems,
                mode: 'subscription',
                metadata: {
                    sandboxId: sandboxId,
                    email: email,
                    tier: tier,
                    source: 'brandlift_portal'
                },
                success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.APP_URL}/cancel`,
                subscription_data: {
                    metadata: {
                        paying_entity: 'Arizona LLC',
                        support_model: 'hybrid_180'
                    }
                }
            });
            return session;
        }
        catch (error) {
            console.error("Stripe Session Creation Failed:", error);
            throw error;
        }
    },
    /**
     * Verify Webhook Signature (Security)
     */
    verifyWebhookSignature(payload, signature) {
        if (!process.env.STRIPE_WEBHOOK_SECRET || !stripeClient)
            return null;
        try {
            return stripeClient.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (error) {
            console.error("Webhook Verification Failed:", error);
            return null;
        }
    },
    /**
     * Get real-time Gross and Net stats for the 'Pricing & Financial Sentinel' dashboard tile
     */
    async getProfitMetrics() {
        if (!stripeClient) {
            // Mock Data reflecting the Arizona LLC model
            return {
                gross: 45200,
                net: 32500,
                mrr: 12450,
                breakdown: {
                    basic: 15, // 15 users @ $180
                    pro: 8, // 8 users @ $350
                    ent: 2 // 2 users @ $900
                }
            };
        }
        // Implementation for real Stripe data fetching would go here
        // For now, return a plausible structure
        const charges = await stripeClient.charges.list({ limit: 100 });
        const gross = charges.data.reduce((acc, charge) => acc + charge.amount, 0) / 100;
        return {
            gross: gross,
            hosting_costs: gross * 0.15, // Est 15% infrastructure
            support_costs: 1800, // Fixed support cost base
            net_profit: gross * 0.65 // Est 65% margin
        };
    },
    /**
     * List active products for configuration
     */
    async listProducts() {
        if (!stripeClient) {
            return Object.values(exports.PRICING_TIERS).map(t => ({
                id: t.id,
                name: t.name,
                active: true,
                default_price: {
                    id: t.id,
                    unit_amount: t.amount,
                    currency: 'usd'
                }
            }));
        }
        const products = await stripeClient.products.list({ active: true, limit: 10, expand: ['data.default_price'] });
        return products.data;
    },
    /**
     * Create/Update a Tier Price (Admin Control)
     */
    async updateTierPrice(tier, amountCents) {
        if (!stripeClient) {
            console.log(`[MOCK] Updated ${tier} price to $${amountCents / 100}`);
            exports.PRICING_TIERS[tier].amount = amountCents;
            return { success: true, tier: exports.PRICING_TIERS[tier] };
        }
        // Real Stripe Logic: Create new price, update product default
        // This effectively "updates" the price for new subscriptions
        const productId = process.env[`STRIPE_PRODUCT_${tier}`];
        if (!productId)
            throw new Error(`Product ID for ${tier} not found in env`);
        const price = await stripeClient.prices.create({
            product: productId,
            unit_amount: amountCents,
            currency: 'usd',
            recurring: { interval: 'month' },
            lookup_key: `${tier.toLowerCase()}_${Date.now()}`
        });
        await stripeClient.products.update(productId, { default_price: price.id });
        return price;
    },
    // Legacy method wrapper if needed, or remove
    async createPrice(productId, amountCents) {
        return this.updateTierPrice('BASIC', amountCents); // Default map
    }
};
//# sourceMappingURL=stripeService.js.map