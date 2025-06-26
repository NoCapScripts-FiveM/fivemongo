import { connectToDatabase } from "../database";
import { middleware } from "../utils/middleware";
import { prepareObject } from "../utils/prepare";

export async function FindAll(
  context?: any,
  callback?: Function
) {
  try {
    if (typeof callback !== "function") callback = undefined;

    // Run middleware if context is provided
    const data = context ? await middleware(context) : null;

    // Determine collection name
    const collectionName = data?.params?.collection || context?.collection;
    if (!collectionName) {
      throw new Error("Collection name must be specified");
    }

    // Resolve and prepare query and options
    let query = data?.params?.query ?? context?.query ?? {};
    let options = data?.params?.options ?? context?.options ?? {};

    query = prepareObject(query);
    options = prepareObject(options);

    if (typeof query !== "object" || Array.isArray(query)) {
      throw new Error("Query must be a plain object.");
    }

    // Connect to database and fetch data
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);
    const results = await collection.find(query, options);

    // Remove MongoDB-specific `_id` field for cleaner data
    const cleanedResults = results.map(({ _id, ...rest }) => rest);

    console.log("Results after cleaning:", cleanedResults);

    // Return the array of results directly
    return callback ? callback(cleanedResults) : cleanedResults;

  } catch (error: any) {
    console.error("Error in FindAll:", error.message);
    if (callback) {
      callback(null, error);
    }
    return null;
  }
}