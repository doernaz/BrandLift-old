"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseService = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
// Initialize Firebase Admin SDK
// Ideally, the service account key should be in an environment variable or a secure file.
// For this scaffolding, we check if configuration exists.
let db = null;
const initializeFirebase = () => {
    try {
        if (db)
            return db;
        // Ensure env vars are loaded
        if (!process.env.BRANDLIFT_SERVICE_ACCOUNT) {
            dotenv_1.default.config({ path: '.env.local' });
        }
        // Strategy 1: Check for local service account file (Preferred for dev)
        // Strategy 2: Check for Env Var (Preferred for production)
        let serviceAccount = null;
        try {
            // Check for file existence synchronously
            const fs = require('fs');
            const path = require('path');
            const keyPath = path.resolve(process.cwd(), 'brandlift-service-account.json');
            if (fs.existsSync(keyPath)) {
                console.log("[Firebase] Found local service account key file.");
                serviceAccount = require(keyPath);
            }
        }
        catch (e) {
            // Ignore fs errors, fall back to env
        }
        if (!serviceAccount && process.env.BRANDLIFT_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.BRANDLIFT_SERVICE_ACCOUNT);
            }
            catch (e) {
                console.error("[Firebase] Failed to parse env var JSON:", e);
            }
        }
        if (!(0, app_1.getApps)().length) {
            if (serviceAccount) {
                (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount)
                });
                console.log("[Firebase] Admin Initialized Successfully");
            }
            else {
                console.warn("[Firebase] No credentials found (File or Env). Live features will fail.");
            }
        }
        db = (0, firestore_1.getFirestore)();
        return db;
    }
    catch (error) {
        console.error("[Firebase] Initialization Error:", error);
        return null;
    }
};
// Auto-init on load (attempt)
initializeFirebase();
// Collections
const COLLECTIONS = {
    CLIENTS: 'clients',
    CONFIG: 'configuration',
    KNOWLEDGE_BASE: 'knowledge_base',
    ACTIVITY_LOGS: 'activity_logs',
    IP_VAULT: 'brandlift_ip_vault', // Secure patented logic
    COMMUNICATIONS: 'communications',
    PRICING_TIERS: 'pricing_tiers',
    BLUEPRINTS: 'blueprints',
    CONFIGURATION: 'configuration' // Fixed duplicate key
};
exports.firebaseService = {
    get db() {
        return app_1.initializeApp ? initializeFirebase() : null;
    },
    // ... (keep existing methods)
    /**
     * Get All Blueprints
     */
    async getBlueprints() {
        const database = initializeFirebase();
        if (!database)
            return [];
        const snapshot = await database.collection(COLLECTIONS.BLUEPRINTS).get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
    /**
     * Save/Create Blueprint
     */
    async saveBlueprint(blueprint) {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized.");
        const id = blueprint.id || `bp_${Date.now()}`;
        await database.collection(COLLECTIONS.BLUEPRINTS).doc(id).set(Object.assign(Object.assign({}, blueprint), { lastUpdated: new Date() }), { merge: true });
        return Object.assign({ id }, blueprint);
    },
    /**
     * Delete Blueprint
     */
    async deleteBlueprint(id) {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized.");
        await database.collection(COLLECTIONS.BLUEPRINTS).doc(id).delete();
        return true;
    },
    /**
     * "Source of Truth": Sync client data to Firestore
     */
    async syncClientData(clientId, data) {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized. Cannot sync data.");
        await database.collection(COLLECTIONS.CLIENTS).doc(clientId).set(Object.assign(Object.assign({}, data), { lastUpdated: new Date() }), { merge: true });
    },
    /**
     * Log platform activity
     */
    async logActivity(action, details) {
        const database = initializeFirebase();
        if (!database) {
            console.warn(`[WARNING] Firebase not initialized. Activity log skipped: ${action}`);
            return;
        }
        await database.collection(COLLECTIONS.ACTIVITY_LOGS).add({
            action,
            details,
            timestamp: new Date()
        });
    },
    /**
     * Retrieve IP Logic safely via API Gateway pattern
     */
    async getPatentedLogic(logicId) {
        const database = initializeFirebase();
        if (!database) {
            console.warn(`[MOCK] Firebase not init. Returning mock Vault data for: ${logicId}`);
            const mockData = {
                'lead_scoring_v1': { name: 'Lead Scoring Algorithm v1', active: true, logic: { factors: [{ id: 'has_website', weight: 0.3 }], threshold: 0.7 } },
                'content_gen_v1': { name: 'SEO Content Generator v1', active: true, template: 'Generate landing page...' },
                'market_analysis_v1': { name: 'Market Saturation Logic v1', active: true, heuristics: ['>5 competitors'] }
            };
            return mockData[logicId] || { error: 'Logic not found in Mock Vault' };
        }
        const doc = await database.collection(COLLECTIONS.IP_VAULT).doc(logicId).get();
        return doc.data();
    },
    /**
     * Get Client Data by ID
     */
    async getClient(clientId) {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized.");
        const doc = await database.collection(COLLECTIONS.CLIENTS).doc(clientId).get();
        return doc.exists ? doc.data() : null;
    },
    /**
     * Get Client Data by Package ID
     * Used to look up FTP credentials for deployment
     */
    async getClientByPackageId(packageId) {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized.");
        const snapshot = await database.collection(COLLECTIONS.CLIENTS)
            .where('packageId', '==', packageId)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return snapshot.docs[0].data();
    },
    /**
     * Get All Clients (Live Dashboard)
     */
    async getAllClients() {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized.");
        const snapshot = await database.collection(COLLECTIONS.CLIENTS).get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
    /**
     * Get Recent Activity Logs (Live Dashboard)
     */
    async getRecentLogs(limit = 20) {
        const database = initializeFirebase();
        if (!database)
            return [];
        const snapshot = await database.collection(COLLECTIONS.ACTIVITY_LOGS)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    },
    /**
     * Auto-Scaffold: Seed Database with Initial Data
     */
    async seedDatabase() {
        const database = initializeFirebase();
        if (!database)
            throw new Error("Firebase not initialized. Cannot seed database.");
        const batch = database.batch();
        // 1. Seed Pricing Tiers
        const pricingTiers = [
            { id: 'starter', name: 'Starter', price: 99, features: ['Basic SEO', '5 Pages'] },
            { id: 'growth', name: 'Growth', price: 297, features: ['Advanced SEO', '20 Pages', 'Blog'] },
            { id: 'enterprise', name: 'Enterprise', price: 997, features: ['Custom SEO', 'Unlimited Pages', 'Priority Support'] }
        ];
        for (const tier of pricingTiers) {
            const ref = database.collection(COLLECTIONS.PRICING_TIERS).doc(tier.id);
            batch.set(ref, tier, { merge: true });
        }
        // 2. Seed Communications (Email Templates)
        const emails = [
            { id: 'welcome', subject: 'Welcome to BrandLift', body: 'Hello {{name}}, welcome...' },
            { id: 'proposal', subject: 'Your BrandLift Proposal', body: 'Hi {{name}}, here is your proposal...' },
            { id: 'handoff', subject: 'Access your new site', body: 'Here are your credentials: {{sso_link}}' }
        ];
        for (const email of emails) {
            const ref = database.collection(COLLECTIONS.COMMUNICATIONS).doc(email.id);
            batch.set(ref, email, { merge: true });
        }
        // 3. Seed Configuration (20i Blueprints)
        batch.set(database.collection(COLLECTIONS.CONFIGURATION).doc('blueprints'), {
            available: ['WordPress Unlimited', 'E-commerce Pack'],
            default_id: 284869
        }, { merge: true });
        // 4. IP Protection: Vault
        const vaultItems = {
            'lead_scoring_v1': { name: 'Lead Scoring Algorithm v1', active: true, logic: { factors: [{ id: 'has_website', weight: 0.3 }], threshold: 0.7 } },
            'content_gen_v1': { name: 'SEO Content Generator v1', active: true, template: 'Generate landing page...' },
            'market_analysis_v1': { name: 'Market Saturation Logic v1', active: true, heuristics: ['>5 competitors'] }
        };
        for (const [key, value] of Object.entries(vaultItems)) {
            const ref = database.collection(COLLECTIONS.IP_VAULT).doc(key);
            batch.set(ref, value, { merge: true });
        }
        await batch.commit();
        console.log("Database Scaffolded Successfully.");
        return { success: true, message: "Database seeded with default schemas." };
    }
};
//# sourceMappingURL=firebaseService.js.map