import { connectToDatabase } from "../database";

export async function CreateIndex(params?: any, callback?: Function) {
  try {
    if (typeof callback !== "function") callback = undefined;
    if (typeof params !== "object") return null;
    if (typeof params.collection !== "string") return null;
    if (typeof params.index !== "object") return null;

    const { db } = await connectToDatabase();
    const collection = db.collection(params.collection);

    const result = await collection.createIndex(params.index);

    if (Config.Debug) { 
      console.log(
        `^2[MongoDB] CreateIndex on collection ${params.collection} completed with index: ${JSON.stringify(params.index)}.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB create index error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
