
import "server-only"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

// Use environment variable for service account or parse strictly if local JSON
const rawServiceAccount = process.env.BRANDLIFT_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT
// Remove quotes if they exist around the JSON string in .env
const cleanServiceAccount = rawServiceAccount ? rawServiceAccount.replace(/^'|'$/g, "") : undefined

const serviceAccount = cleanServiceAccount
    ? JSON.parse(cleanServiceAccount)
    : undefined

const firebaseAdminConfig = {
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: serviceAccount?.project_id,
}

export function initAdmin() {
    if (getApps().length <= 0) {
        if (!serviceAccount) {
            console.warn("BRANDLIFT_SERVICE_ACCOUNT not found in environment. Firebase Admin not initialized.")
            return null
        }
        return initializeApp(firebaseAdminConfig)
    }
    return getApps()[0]
}

export { FieldValue }

export const db = (function () {
    const app = initAdmin()
    if (app) return getFirestore(app)
    return null
})()
