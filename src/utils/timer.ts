<<<<<<< HEAD
declare function GetGameTimer(): number;

export async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = GetGameTimer();

  return fn()
    .then((result) => {
      const end = GetGameTimer();
      console.log(`[MongoDB] ${label} executed in ${end - start}ms`);
      return result;
    })
    .catch((error) => {
      const end = GetGameTimer();
      console.error(`[MongoDB] ${label} failed in ${end - start}ms`, error);
      throw error;
    });
}
=======
export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>,
  thresholdMs = 100
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > thresholdMs) {
    console.warn(
      `^3[MongoDB] ${name} took ${duration.toFixed(2)}ms^7`
    );
  }

  return result;
}

// ex.
/* exports("Count", (...args) => withTiming("Count", () => Count(...args))); */
>>>>>>> e7af1223fa0cdee6dd5f95918b390b08bbdb0d7e
