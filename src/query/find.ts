import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function Find(
  context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    const data = await middleware(context);
    if (typeof data !== "object" || data === null) return null;

    // Use empty object if query is null or undefined
    let query = prepareObject(data.params?.query);
    if (!query || typeof query !== "object" || Array.isArray(query)) {
      query = {};
    }

    const options = prepareObject(data.params?.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(data.params?.collection || context.collection);

    const cursor = collection.find(query, options);
    const results = await cursor.toArray();
    if (Config.Debug) {
      console.log(
        `^2[MongoDB] Find on collection ${data.params?.collection || context.collection} completed with ${results.length} documents found.^7`
      );
    }
    return callback ? callback(results) : results;
  } catch (error: any) {
    console.error("MongoDB find error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
