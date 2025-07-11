import * as admin from 'firebase-admin';

// Ensure this file is only run on the server
import 'server-only';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!serviceAccount) {
  console.warn(
    'Firebase service account key is not set in environment variables. Server-side admin functionality will not work.'
  );
}

let adminApp: admin.app.App | null = null;
let adminDb: admin.firestore.Firestore | null = null;

function initializeAdminApp() {
  if (admin.apps.length === 0 && serviceAccount) {
    console.log('Initializing Firebase Admin SDK...');
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    adminDb = admin.firestore();
  } else if (admin.apps.length > 0) {
    adminApp = admin.apps[0];
    if (adminApp) {
        adminDb = admin.firestore(adminApp);
    }
  }
}

// Initialize on module load
initializeAdminApp();

export { adminDb, adminApp, initializeAdminApp };
