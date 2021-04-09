(global as any).XMLHttpRequest = require('xhr2');
import firebase from 'firebase';
import 'firebase/storage';

!firebase.apps.length &&
  firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: 'renft-mooncat-images.firebaseapp.com',
    projectId: 'renft-mooncat-images',
    storageBucket: 'renft-mooncat-images.appspot.com',
    messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_ANALYTICS_ID,
  });

export const storage = firebase.storage();
