import { useEffect, useState } from "react";

import { getRemainingSeconds } from "@/features/attempts/attempt.utils";

export function useAttemptCountdown(deadlineAt?: string | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    () => {
      return deadlineAt ? getRemainingSeconds(deadlineAt) : null;
    },
  );
  useEffect(() => {
    if (!deadlineAt) {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(getRemainingSeconds(deadlineAt));

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(deadlineAt));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [deadlineAt]);

  return {
    remainingSeconds,
    isCountdownReady: remainingSeconds !== null,
    isExpired: remainingSeconds !== null && remainingSeconds <= 0,
  };
}
