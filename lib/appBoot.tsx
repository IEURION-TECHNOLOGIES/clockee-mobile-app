// ======================= lib/appBoot.ts =======================

let appBootPromise: Promise<void> | null = null;

let appBootCompleted = false;

export function startAppBoot(
  duration = 3000
) {
  if (appBootPromise) {
    return appBootPromise;
  }

  appBootPromise = new Promise<void>(
    (resolve) => {
      setTimeout(() => {
        appBootCompleted = true;
        resolve();
      }, duration);
    }
  );

  return appBootPromise;
}

export function isAppBootCompleted() {
  return appBootCompleted;
}

