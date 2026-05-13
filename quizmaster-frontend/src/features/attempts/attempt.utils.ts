export function getRemainingSeconds(deadlineAt: string) {
  const deadlineTime = new Date(deadlineAt).getTime();
  const now = Date.now();

  return Math.max(0, Math.floor((deadlineTime - now) / 1000));
}

export function formatRemainingTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
