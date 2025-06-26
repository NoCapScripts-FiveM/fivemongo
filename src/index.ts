import { sleep } from "./utils/sleep";
import { connectToDatabase } from "./database";
import { withTiming } from "./utils/timer";
import { Count } from "./query/count";
import { Find } from "./query/find";
import { FindOne } from "./query/findOne";
import { FindMany } from "./query/findMany";
import { UpdateOne } from "./query/updateOne";
import { InsertOne } from "./query/insertOne";
import { BulkWrite } from "./query/bulkWrite";
import { DeleteOne } from "./query/deleteOne";
import { InsertMany } from "./query/insertMany";
import { UpdateMany } from "./query/updateMany";
import { ReplaceOne } from "./query/replaceOne";
import { DeleteMany } from "./query/deleteMany";
import { CreateIndex } from "./query/createIndex";
import { FindOneAndDelete } from "./query/findOneAndDelete";
import { FindAll } from "./query/findAll";

export const credentials: string = GetConvar("mongoCredentials", "null");
export const resourceName: string = GetCurrentResourceName();

async function initializeMongo() {
  while (true) {
    try {
      await connectToDatabase();
      console.log("^2MongoDB connection established^7");
      break; // exit loop on successful connection
    } catch (error: any) {
      console.error(`^1MongoDB connection failed: ${error.message}, retrying in 30 seconds...^7`);
      await sleep(30000);
    }
  }
}

// Run the MongoDB initialization on resource start
initializeMongo().catch((err) => {
  console.error("^1Unhandled error during MongoDB initialization:^7", err);
});

// Export all query functions for FiveM usage
const queries = {
  Count,
  Find,
  FindOne,
  FindMany,
  FindAll,
  FindOneAndDelete,
  InsertOne,
  InsertMany,
  UpdateOne,
  UpdateMany,
  ReplaceOne,
  DeleteOne,
  DeleteMany,
  BulkWrite,
  CreateIndex,
};

// Export each with timing
for (const [name, fn] of Object.entries(queries)) {
  exports(name, (...args: any[]) => withTiming(name, () => fn(...args)));
}

