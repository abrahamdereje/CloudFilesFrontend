import { defineNuxtPlugin } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  const app: FirebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
      apiKey: 'AIzaSyAALgJ4AC89AfHsX_onAoJZHswlkLzkufs',
      authDomain: 'cloudstoragedemo-d531d.firebaseapp.com',
      projectId: 'cloudstoragedemo-d531d',
      storageBucket: 'cloudstoragedemo-d531d.appspot.com',
      messagingSenderId: '1052909655724',
      appId: '1:1052909655724:web:50e3a3293f5ffc0140b109'
    })

  const auth: Auth | null = process.client ? getAuth(app) : null

  return {
    provide: {
      firebase: {
        app,
        auth
      }
    }
  }
})