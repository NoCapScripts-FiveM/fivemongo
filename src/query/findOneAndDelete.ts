import { ObjectId } from "mongodb";
import { connectToDatabase } from "../database";
import { prepareObject } from "../utils/prepare";

/**
 * Deletes and returns a single document matching the filter.
 */
export async function FindOneAndDelete(
  context?: any,
  callback?: Function
) {
  try {
    if (!context || typeof context !== "object") {
      throw new Error("Params must be an object.");
    }

    const { collection, filter, options } = context;

    if (!collection || typeof collection !== "string") {
      throw new Error("Invalid or missing 'collection' name.");
    }

    const { db } = await connectToDatabase();
    const preparedFilter = prepareObject(filter);

    if (!preparedFilter || typeof preparedFilter !== "object" || Array.isArray(preparedFilter)) {
      throw new Error("Invalid filter: must be a non-array object.");
    }

    // Convert _id to ObjectId if it's a string
    if (preparedFilter._id && typeof preparedFilter._id === "string") {
      try {
        preparedFilter._id = new ObjectId(preparedFilter._id);
      } catch (e) {
        throw new Error("Invalid ObjectId format.");
      }
    }

    const result = await db
      .collection(collection)
      .findOneAndDelete(preparedFilter, options || {});

    const deletedDocument = result?.value || null;
  
    if (Config.Debug) {
      console.log(
        `^2[MongoDB] FindOneAndDelete on collection ${collection} completed with document: ${JSON.stringify(deletedDocument)}.^7`
      );
    }

    return callback ? callback(deletedDocument) : deletedDocument;
  } catch (error: any) {
    console.error("MongoDB findOneAndDelete error:", error.message);
    return callback ? callback(null) : null;
  }
}
