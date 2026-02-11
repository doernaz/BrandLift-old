import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log("FIREBASE_SERVICE_ACCOUNT:", process.env.FIREBASE_SERVICE_ACCOUNT ? "EXISTS" : "UNDEFINED");
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Length:", process.env.FIREBASE_SERVICE_ACCOUNT.length);
    console.log("First 20 chars:", process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 20));
}
