import { connectToDatabase } from "../database";

export async function BulkWrite(context?: any, callback?: Function) {
  try {
    if (typeof callback !== "function") callback = undefined;
    if (typeof context !== "object") return null;
    if (typeof context.collection !== "string") return null;
    if (!Array.isArray(context.operations)) return null;

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.bulkWrite(context.operations);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] BulkWrite on collection ${context.collection} completed with ${result.modifiedCount} modified and ${result.upsertedCount} upserted documents.^7`
      );
    }
    

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB bulk write error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
