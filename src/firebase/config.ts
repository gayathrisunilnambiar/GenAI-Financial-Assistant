import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Optional: Only if you need analytics
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDkxxT8qygGBZxfE9FP6ybLayyWUbdyvHc",
  authDomain: "ai-financial-assistant-50599.firebaseapp.com",
  projectId: "ai-financial-assistant-50599",
  storageBucket: "ai-financial-assistant-50599.firebasestorage.app",
  messagingSenderId: "314742590722",
  appId: "1:314742590722:web:7a5f4b79d038d8cb57461b",
  measurementId: "G-C0GRZGFE0J"
};

// Validate required configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingConfig.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${missingConfig.join(', ')}`);
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

console.log("Firebase Config:", firebaseConfig);

export { auth, db };
