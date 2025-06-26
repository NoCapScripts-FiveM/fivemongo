import * as TheQueries from "./query/queries";
import { withTiming } from "./utils/timer";

export const credentials: string = GetConvar("mongoCredentials", "null");
export const resourceName: string = GetCurrentResourceName();

// Wrap each query function with timing
for (const [name, fn] of Object.entries(TheQueries)) {
  if (typeof fn === "function") {
    exports(name, async (...args: any[]) => {
      return withTiming(() => fn(...args), { label: name });
    });
  }
}

// Optional: log ready message
setTimeout(() => {
  console.log("^2MongoDB module loaded and ready^7");
}, 500);
