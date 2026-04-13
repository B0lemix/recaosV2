import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: import.meta.env.VITE_KEY as string,
   authDomain: import.meta.env.VITE_DOMAIN as string,
   projectId: import.meta.env.VITE_ID as string,
   storageBucket: import.meta.env.VITE_Bucket as string,
   messagingSenderId: import.meta.env.VITE_SenderId as string,
   appId: import.meta.env.VITE_APP as string,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
