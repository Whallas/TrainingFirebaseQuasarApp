import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file

export default async ({ /* app, router, */ Vue }) => {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.App.FIREBASE_API_KEY,
    authDomain: process.env.App.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.App.FIREBASE_DATABASE_URL,
    projectId: process.env.App.PROJECT_ID,
    storageBucket: process.env.App.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.App.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.App.FIREBASE_APP_ID,
  }
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)

  firebase.auth().languageCode = 'pt'

  Vue.prototype.$auth = firebase.auth()
  Vue.prototype.$firestore = firebase.firestore()

  /**
   * @see https://firebase.google.com/docs/emulator-suite/connect_firestore?authuser=0#instrument_your_app_to_talk_to_the_emulators
   */
  if (process.env.DEV) {
    firebase.firestore()
      .settings({
        host: process.env.App.FIRESTORE_DEV_HOST || 'localhost:8080',
        ssl: false
      })
  }
}
