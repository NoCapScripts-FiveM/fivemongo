import { resourceName } from "..";
import { connectToDatabase } from "../database";

export async function middleware(params?: any) {
  // Schedule resource tick (assuming this is defined elsewhere)
  ScheduleResourceTick(resourceName);

  // Validate params
  if (typeof params !== "object" || typeof params.collection !== "string") {
    console.error('^1Invalid params to make a query: params must be an object with a collection string^7');
    return null;
  }

  try {
    const { db } = await connectToDatabase();

    const collection = db.collection(params.collection);
    if (!collection) {
      console.error(`^1Collection ${params.collection} not found^7`);
      return null;
    }

    return { collection, params };
  } catch (error: any) {
    console.error("^1Error in middleware connecting to DB:^7", error.message);
    return null;
  }
}