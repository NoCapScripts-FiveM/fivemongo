import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function UpdateMany(
   context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    const data = await middleware(context);
    if (typeof data !== "object" || data === null) return null;

    const query = prepareObject(data.params.query);
    const update = prepareObject(data.params.update);
    const options = prepareObject(data.params.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.updateMany(query, update, options);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] UpdateMany on collection ${context.collection} completed with ${result.modifiedCount} documents updated.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB updateMany error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
