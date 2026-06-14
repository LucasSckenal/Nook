"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/**
 * Inicialização preguiçosa e tolerante do Firebase.
 *
 * As chaves vêm de variáveis NEXT_PUBLIC_* (veja `.env.example`). Se não
 * estiverem definidas, `isFirebaseConfigured` é falso e tudo segue no modo
 * visitante (localStorage), sem quebrar — o login simplesmente avisa que o
 * Firebase ainda não foi configurado. Assim a estrutura já vive no código
 * antes mesmo do projeto Firebase existir.
 */

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

/** Retorna as instâncias do Firebase, criando-as sob demanda (só no cliente). */
export function getFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
} {
  if (!isFirebaseConfigured || typeof window === "undefined") {
    return { app: null, auth: null, db: null };
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
    authInstance = getAuth(app);
    // Firestore com cache persistente (offline-first, multi-aba). Se o
    // ambiente não suportar IndexedDB, cai no Firestore em memória.
    try {
      dbInstance = initializeFirestore(app, {
        // campos undefined (ex.: tarefa sem prazo) são ignorados em vez de
        // quebrar o setDoc — que valida e LANÇA de forma síncrona
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      dbInstance = getFirestore(app);
    }
  }
  return { app, auth: authInstance, db: dbInstance };
}
