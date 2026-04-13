import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: import.meta.env.VITE_KEY,
   authDomain: import.meta.env.VITE_DOMAIN,
   projectId: import.meta.env.VITE_ID,
   storageBucket: import.meta.env.VITE_Bucket,
   messagingSenderId: import.meta.env.VITE_SenderId,
   appId: import.meta.env.VITE_APP,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
