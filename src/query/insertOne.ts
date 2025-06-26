import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function InsertOne(
  context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    const data = await middleware(context);
    if (typeof data !== "object" || data === null) return null;

    const document = prepareObject(data.params.document);
    const options = prepareObject(data?.params?.options);

    const { db } = await connectToDatabase();
    const collection = db.collection(context.collection);

    const result = await collection.insertOne(document, options);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] InsertOne on collection ${context.collection} completed with document: ${JSON.stringify(result.ops[0])}.^7`
      );
    }

    return callback ? callback(result) : result;
  } catch (error: any) {
    console.error("MongoDB insertOne error caught:", error.message);
    return callback ? callback(null) : null;
  }
}
