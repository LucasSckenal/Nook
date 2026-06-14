"use client";

import { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { syncSlice, useNook, type SyncSlice } from "@/lib/store";
import { useSyncStatus, type SyncState } from "@/lib/syncStatus";
import { useFocusTrap } from "@/components/useFocusTrap";

const setSync = (s: SyncState) => useSyncStatus.getState().setStatus(s);

/**
 * Ponte store ↔ Firestore. Enquanto houver usuário logado:
 *  - decide a sincronização inicial com getDoc (autoritativo, do servidor
 *    quando online) — evita a corrida com o cache offline;
 *  - depois escuta /users/{uid} em tempo real e hidrata o quarto;
 *  - empurra mudanças locais (debounced) de volta para a nuvem;
 *  - conta nova: sobe o que o visitante já tinha (migração no 1º login);
 *  - conta existente em que o APARELHO tem algo que a nuvem não tem: pergunta
 *    se quer juntar tudo ou usar a conta (nunca descarta sem confirmar).
 *
 * Preferências do aparelho (tema, sons, chave do Gemini, rádio, onboarding)
 * NÃO sobem — continuam no localStorage. Só o semestre é sincronizado.
 */

interface Conflict {
  cloud: SyncSlice;
  local: SyncSlice;
}

function readSlice(r: DocumentData | undefined): SyncSlice {
  return {
    subjects: r?.subjects ?? [],
    tasks: r?.tasks ?? [],
    sessions: r?.sessions ?? [],
    notes: r?.notes ?? [],
    userName: r?.userName ?? useNook.getState().userName,
  };
}

function hasData(s: SyncSlice): boolean {
  return (
    s.subjects.length > 0 ||
    s.tasks.length > 0 ||
    s.sessions.length > 0 ||
    s.notes.length > 0
  );
}

/** conjunto de todos os ids do semestre (prefixado por tipo) */
function idSet(s: SyncSlice): Set<string> {
  const set = new Set<string>();
  for (const x of s.subjects) set.add("s:" + x.id);
  for (const x of s.tasks) set.add("t:" + x.id);
  for (const x of s.sessions) set.add("e:" + x.id);
  for (const x of s.notes) set.add("n:" + x.id);
  return set;
}

/** o aparelho tem algum item que a nuvem não tem? (merge preservaria algo) */
function localHasExtra(local: SyncSlice, cloud: SyncSlice): boolean {
  const c = idSet(cloud);
  for (const id of idSet(local)) if (!c.has(id)) return true;
  return false;
}

/** une duas listas por id — o item da nuvem vence em caso de id repetido */
function mergeById<T extends { id: string }>(cloud: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const c of cloud) map.set(c.id, c);
  for (const l of local) if (!map.has(l.id)) map.set(l.id, l);
  return [...map.values()];
}

function mergeSlices(cloud: SyncSlice, local: SyncSlice): SyncSlice {
  return {
    subjects: mergeById(cloud.subjects, local.subjects),
    tasks: mergeById(cloud.tasks, local.tasks),
    sessions: mergeById(cloud.sessions, local.sessions),
    notes: mergeById(cloud.notes, local.notes),
    userName: cloud.userName || local.userName,
  };
}

export function FirestoreSync() {
  const { user, status } = useAuth();
  const applyingRemote = useRef(false);
  const awaiting = useRef(false); // pausa a sync enquanto o usuário decide
  const lastJson = useRef<string | null>(null);
  const debounce = useRef<number | null>(null);
  const refRef = useRef<DocumentReference | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);

  // aplica dados remotos no store sem disparar um novo envio (anti-eco)
  function applyRemote(data: SyncSlice) {
    applyingRemote.current = true;
    useNook.getState().hydrate(data);
    lastJson.current = JSON.stringify(data);
    applyingRemote.current = false;
  }

  useEffect(() => {
    if (status !== "authed" || !user) {
      lastJson.current = null;
      awaiting.current = false;
      setConflict(null);
      setSync("guest");
      return;
    }
    const { db } = getFirebase();
    if (!db) return;

    // reflete conexão: offline mostra "salvo no aparelho", online volta a "salvo"
    const onOffline = () => setSync("offline");
    const onOnline = () => setSync("saved");
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    if (!navigator.onLine) setSync("offline");

    const ref = doc(db, "users", user.uid);
    refRef.current = ref;
    let cancelled = false;
    let unsubDoc: () => void = () => {};
    let unsubStore: () => void = () => {};

    // escuta ao vivo (outros dispositivos) + envia mudanças locais
    function setupLive() {
      unsubDoc = onSnapshot(
        ref,
        (snap) => {
          if (snap.metadata.hasPendingWrites) return; // eco da nossa escrita
          if (awaiting.current || !snap.exists()) return;
          const remote = readSlice(snap.data());
          const json = JSON.stringify(remote);
          if (json === lastJson.current) return;
          applyRemote(remote);
        },
        (err) => console.error("[Nook] sincronização Firestore:", err.code ?? err)
      );

      unsubStore = useNook.subscribe((s) => {
        if (applyingRemote.current || awaiting.current) return;
        const data = syncSlice(s);
        const json = JSON.stringify(data);
        if (json === lastJson.current) return;
        setSync("saving");
        if (debounce.current) window.clearTimeout(debounce.current);
        debounce.current = window.setTimeout(() => {
          lastJson.current = json;
          setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
            .then(() => setSync("saved"))
            .catch(() => setSync("offline"));
        }, 800);
      });
    }

    // decisão inicial autoritativa (servidor quando online)
    (async () => {
      let snap;
      try {
        snap = await getDoc(ref);
      } catch (e) {
        console.error("[Nook] sincronização Firestore (getDoc):", e);
        return;
      }
      if (cancelled) return;

      const local = syncSlice(useNook.getState());
      if (!snap.exists()) {
        // conta nova: semeia a nuvem com o que está no aparelho
        setSync("saving");
        lastJson.current = JSON.stringify(local);
        try {
          await setDoc(ref, { ...local, updatedAt: serverTimestamp() });
          setSync("saved");
        } catch {
          setSync("offline"); // regras/offline — reenvia no próximo write
        }
      } else {
        const remote = readSlice(snap.data());
        if (hasData(remote) && localHasExtra(local, remote)) {
          // conflito real: o aparelho tem algo que a conta não tem
          awaiting.current = true;
          setConflict({ cloud: remote, local });
        } else {
          applyRemote(remote); // sem conflito: a conta manda
          setSync("saved");
        }
      }

      if (cancelled) return;
      setupLive();
    })();

    return () => {
      cancelled = true;
      unsubDoc();
      unsubStore();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      if (debounce.current) window.clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  // logout em aparelho compartilhado: ao sair, limpa a cópia local do semestre
  // (a conta continua salva na nuvem). Roda só na transição authed→guest e
  // DEPOIS do efeito de sync acima desligar a assinatura — então não empurra
  // o estado vazio para a nuvem. Limpa para vazio (não demo) para não gerar
  // falso conflito no próximo login.
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === "authed" && status === "guest") {
      useNook.getState().hydrate({
        subjects: [],
        tasks: [],
        sessions: [],
        notes: [],
        userName: "Marina",
      });
    }
    prevStatus.current = status;
  }, [status]);

  function resolveCloud() {
    if (!conflict) return;
    applyRemote(conflict.cloud);
    awaiting.current = false;
    setConflict(null);
    setSync("saved");
  }

  function resolveMerge() {
    if (!conflict || !refRef.current) return;
    const merged = mergeSlices(conflict.cloud, conflict.local);
    applyRemote(merged);
    awaiting.current = false;
    setSync("saving");
    setDoc(refRef.current, { ...merged, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => setSync("saved"))
      .catch(() => setSync("offline"));
    setConflict(null);
  }

  if (!conflict) return null;
  return (
    <MergeModal conflict={conflict} onCloud={resolveCloud} onMerge={resolveMerge} />
  );
}

function MergeModal({
  conflict,
  onCloud,
  onMerge,
}: {
  conflict: Conflict;
  onCloud: () => void;
  onMerge: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  const { local, cloud } = conflict;
  const count = (s: SyncSlice) =>
    `${s.subjects.length} disciplina${s.subjects.length !== 1 ? "s" : ""} · ${s.tasks.length} tarefa${s.tasks.length !== 1 ? "s" : ""}`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 60% 55% at 50% 45%, #04060a66, #04060ad0 80%)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Juntar dados do quarto"
    >
      <div
        ref={ref}
        className="w-[min(480px,94vw)] rounded-(--radius-lg) p-7 sm:p-8"
        style={{
          background: "color-mix(in srgb, var(--color-room) 86%, transparent)",
          backdropFilter: "blur(20px) saturate(1.15)",
          WebkitBackdropFilter: "blur(20px) saturate(1.15)",
          boxShadow:
            "0 32px 90px #00000080, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
        }}
      >
        <h2 className="font-display text-xl text-ink-high">
          Encontramos dois quartos.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-mid">
          Há dados aqui neste aparelho e também na sua conta. Como você quer
          continuar? Nada é apagado sem você escolher.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-(--radius-md) bg-surface p-3">
            <p className="mb-1 text-ink-low">🖥 neste aparelho</p>
            <p className="text-ink-high">{count(local)}</p>
          </div>
          <div className="rounded-(--radius-md) bg-surface p-3">
            <p className="mb-1 text-ink-low">☁️ na sua conta</p>
            <p className="text-ink-high">{count(cloud)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={onMerge}
            className="w-full rounded-(--radius-md) bg-amber py-3 text-sm font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.01]"
          >
            juntar tudo
            <span className="ml-1 opacity-70">— mantém os dois</span>
          </button>
          <button
            onClick={onCloud}
            className="w-full rounded-(--radius-md) bg-raised py-3 text-sm text-ink-high shadow-[0_0_0_1px_#ffffff12] transition-colors hover:bg-raised/70"
          >
            usar a conta
            <span className="ml-1 text-ink-low">— descarta o deste aparelho</span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-ink-low">
          dúvida? “juntar tudo” é o mais seguro — depois dá para arrumar
        </p>
      </div>
    </div>
  );
}
