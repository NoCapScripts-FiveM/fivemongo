import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function DeleteMany(
   context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    const data = await middleware(context);
    if (typeof data !== "object" || data === null) return null;

    const query = prepareObject(data.params.query);
    const options = prepareObject(data.params.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.deleteMany(query, options);

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB deleteMany error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
