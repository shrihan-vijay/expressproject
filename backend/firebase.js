require("dotenv").config(); //loads environment variables from the .env file into process.env

const { initializeApp } = require("firebase/app"); //imports function used to initialize/connect app to Firebase
const { getFirestore } = require("firebase/firestore"); //imports Firestore database service

// Firebase project configuration object
// identifies which Firebase project/database to connect to
const firebaseConfig = {

  apiKey: process.env.API_KEY, //unique API key for Firebase project

  authDomain: process.env.AUTH_DOMAIN, //authentication domain for Firebase project

  projectId: process.env.PROJECT_ID, //unique Firebase project ID

  storageBucket: process.env.STORAGE_BUCKET, //storage bucket used for Firebase Storage

  messagingSenderId: process.env.MESSAGING_SENDER_ID, //sender ID mainly used for Firebase messaging services

  appId: process.env.APP_ID //unique ID for this Firebase app
};

// initializes Firebase using the config object above
// creates the connection between backend and Firebase
const app = initializeApp(firebaseConfig);

// connects specifically to Firestore database service
// db now represents the Firestore database
const db = getFirestore(app);

module.exports = db; //exports Firestore database connection so other files can use it