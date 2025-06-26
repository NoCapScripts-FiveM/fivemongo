import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function FindOne(context?: any, callback?: Function) {
  try {
    //console.log("FindOne context:", context);

    if (!context || typeof context !== "object") {
      console.warn("Invalid context passed to FindOne.");
      return callback ? callback(null) : null;
    }

    const data = await middleware(context);
    if (!data || typeof data !== "object") {
      console.warn("Middleware returned invalid data.");
      return callback ? callback(null) : null;
    }

    const query = prepareObject(data.params?.query || {});
    const options = prepareObject(data.params?.options || {});
    const { db } = await connectToDatabase();
    const collection = db.collection(data.params?.collection || context.collection);

   
    const result = await collection.findOne(query, options);

    if (Config.Debug) {
      console.log(
        `^2[MongoDB] FindOne on collection ${data.params?.collection || context.collection} completed with document: ${JSON.stringify(result)}.^7`
      );
    }  
    return callback ? callback(result) : result;

  } catch (error: any) {
    console.error("FindOne error:", error.message);
    return callback ? callback(null) : null;
  }
}
