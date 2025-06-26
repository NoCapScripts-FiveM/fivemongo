import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function Count(params?: any, callback?: Function) {
  try {
     if (typeof callback !== "function") callback = undefined;
    if (typeof params !== "object") return null;
    if (typeof params.collection !== "string") return null;

    const data = await middleware(params);
    if (typeof data !== "object" || data === null) return null;

    const query = prepareObject(data.params.query);
    const options = prepareObject(data.params.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(params.collection);

    const result = await collection.countDocuments(query, options);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] Count on collection ${params.collection} completed with ${result} documents matching the query.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB count error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
