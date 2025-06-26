import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function InsertMany(
   context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    const data = await middleware(context);
    if (typeof data !== "object" || data === null) return null;

    const documents = prepareObject(data.params.documents);
    const options = prepareObject(data.params.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.insertMany(documents, options);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] InsertMany on collection ${context.collection} completed with ${result.insertedCount} documents inserted.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB insertMany error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
