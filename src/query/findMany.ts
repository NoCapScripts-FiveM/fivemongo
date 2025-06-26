import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

interface FindManyContext {
  collection?: string;
  query?: Record<string, any>;
  options?: Record<string, any>;
  [key: string]: any;
}

type FindManyCallback = (result: any[] | null) => void;

export async function FindMany(
  context?: FindManyContext,
  callback?: FindManyCallback
): Promise<any[] | null | void> {
  try {
    const runCallback = typeof callback === "function" ? callback : undefined;

    // Run middleware if context exists
    const processedContext = context ? await middleware(context) : {};
    const params = processedContext?.params || {};

    // Determine collection name
    const collectionName = params.collection || context?.collection;
    if (!collectionName) {
      throw new Error("Collection name must be specified.");
    }

    // Resolve and sanitize query and options
    const rawQuery = params.query || context?.query || {};
    const rawOptions = params.options || context?.options || {};

    const query = prepareObject(rawQuery);
    const options = prepareObject(rawOptions);

    if (typeof query !== "object" || Array.isArray(query)) {
      throw new Error("Query must be a plain object.");
    }

    // Connect to the database and perform the query
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);
    const results = await collection.find(query, options).limit(50).toArray();

<<<<<<< HEAD
    if (runCallback) {
      runCallback(results);
    } else {
      return results;
    }
  } catch (error) {
    console.error("Error in FindMany:", error);
    if (typeof callback === "function") {
      callback(null);
    } else {
      return null;
    }
=======
    const cursor = collection.find(query, options);
    const results = await cursor.toArray();
    if (Config.Debug) {
      console.log(
        `^2[MongoDB] FindMany on collection ${collectionName} completed with ${results.length} documents found.^7`
      );
    }
    return callback ? callback(results) : results;
  } catch (error: any) {
    console.error("MongoDB findMany error caught:", error.message);
    return callback ? callback(null) : null;
>>>>>>> e7af1223fa0cdee6dd5f95918b390b08bbdb0d7e
  }
}
