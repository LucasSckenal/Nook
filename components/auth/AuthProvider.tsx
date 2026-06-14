"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { useNook } from "@/lib/store";

/**
 * Fundação de autenticação do Nook.
 *
 * O login é OPCIONAL: sem usuário (ou sem Firebase configurado) o app segue
 * no modo visitante, exatamente como hoje (localStorage). Quando há usuário,
 * a estrutura já fica pronta para, numa próxima fase, sincronizar os dados do
 * quarto com o Firestore. Aqui cuidamos só de identidade.
 */

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

/** loading: ainda decidindo · authed: logado · guest: visitante (sem login) */
export type AuthStatus = "loading" | "authed" | "guest";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** o Firebase tem chaves válidas? (senão, só visitante) */
  configured: boolean;
  /** ação em andamento (desabilita botões) */
  busy: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
    isAnonymous: u.isAnonymous,
  };
}

/** Traduz os códigos do Firebase Auth para um português gentil. */
function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Esse e-mail não parece válido.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "E-mail ou senha não conferem.";
    case "auth/email-already-in-use":
      return "Já existe uma conta com esse e-mail. Tente entrar.";
    case "auth/weak-password":
      return "A senha precisa de pelo menos 6 caracteres.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "A janela do Google foi fechada antes de concluir.";
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Libere os pop-ups.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Respire e tente de novo em instantes.";
    default:
      return "Algo não saiu como esperado. Tente novamente.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? "loading" : "guest"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // observa o estado de login enquanto o app estiver aberto
  useEffect(() => {
    const { auth } = getFirebase();
    if (!auth) {
      setStatus("guest");
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(toAuthUser(u));
        setStatus("authed");
        // ponte com o quarto: o nome do usuário passa a cumprimentá-lo
        if (u.displayName) {
          const store = useNook.getState();
          if (!store.userName || store.userName === "Marina") {
            store.setUserName(u.displayName.split(" ")[0]);
          }
        }
      } else {
        setUser(null);
        setStatus("guest");
      }
    });
    return unsub;
  }, []);

  const run = useCallback(
    async (fn: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        return true;
      } catch (e) {
        const code =
          typeof e === "object" && e && "code" in e
            ? String((e as { code: unknown }).code)
            : "";
        setError(friendlyError(code));
        return false;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(
    () =>
      run(async () => {
        const { auth } = getFirebase();
        if (!auth) throw { code: "auth/not-configured" };
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
      }),
    [run]
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      run(async () => {
        const { auth } = getFirebase();
        if (!auth) throw { code: "auth/not-configured" };
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }),
    [run]
  );

  const registerWithEmail = useCallback(
    (name: string, email: string, password: string) =>
      run(async () => {
        const { auth } = getFirebase();
        if (!auth) throw { code: "auth/not-configured" };
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
          setUser(toAuthUser(cred.user));
          const store = useNook.getState();
          if (!store.userName || store.userName === "Marina") {
            store.setUserName(name.trim().split(" ")[0]);
          }
        }
      }),
    [run]
  );

  const signOutUser = useCallback(async () => {
    const { auth } = getFirebase();
    if (!auth) return;
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        configured: isFirebaseConfigured,
        busy,
        error,
        clearError,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
