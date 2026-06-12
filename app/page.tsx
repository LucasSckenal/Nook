import { Suspense } from "react";
import { RoomShell } from "@/components/room/RoomShell";

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen items-center justify-center bg-void">
          <p className="font-display text-xl text-ink-low">acendendo a luz…</p>
        </main>
      }
    >
      <RoomShell />
    </Suspense>
  );
}
