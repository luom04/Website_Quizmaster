import { lazy, Suspense } from "react";

import { env } from "@/config/env";

const Agentation = import.meta.env.DEV
  ? lazy(() =>
      import("agentation").then((module) => ({
        default: module.Agentation,
      })),
    )
  : null;

export function AgentationDevtools() {
  if (!env.ENABLE_AGENTATION || !Agentation) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <Agentation
        endpoint="http://localhost:4747"
        onSessionCreated={(sessionId) => {
          console.log("[Agentation] Session started:", sessionId);
        }}
      />
    </Suspense>
  );
}
