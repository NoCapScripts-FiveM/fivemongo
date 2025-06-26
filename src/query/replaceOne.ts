import { connectToDatabase } from "../database";

export async function ReplaceOne( context?: any, callback?: Function) {
  try {
    if (typeof callback !== "function") callback = undefined;
    if (typeof context !== "object") return null;
    if (typeof context.collection !== "string") return null;
    if (typeof context.filter !== "object") return null;
    if (typeof context.replacement !== "object") return null;

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.replaceOne(context.filter, context.replacement);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] ReplaceOne on collection ${context.collection} completed with matchedCount: ${result.matchedCount}, modifiedCount: ${result.modifiedCount}.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB replaceOne error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
