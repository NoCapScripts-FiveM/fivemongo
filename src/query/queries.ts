import {
  UpdateResult,
  WithId,
  Document,
  MongoClient,
  MongoClientOptions,
  Db,
  InsertOneResult,
  InsertManyResult,
  DeleteResult,
  UpdateManyResult,
} from "mongodb";

// Config from env or fallback
const url: string = GetConvar("mongoCredentials", "none");
const dbName: string = GetConvar("mongoDatabase", "none");

/* @ts-ignore */
RegisterNetEvent("frmz-mongodb:DatabaseConnected");

type Result<T = any> = {
 /*  success: boolean; */
  data?: T;
  error?: string | null;
};

type Error<T = any> = {
  success: boolean;
  error?: any | null;
};

class MongoDB {
  private client: MongoClient;
  private db: Db | null = null;
  private connected = false;

  constructor(private url: string, private dbName: string) {
    if (url === "none" || dbName === "none") {
      throw new Error("Both `url` and `dbName` must be provided and cannot be 'none'");
    }

    this.client = new MongoClient(this.url); // Options are no longer needed here
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.connected = true;
  }

  async close(): Promise<void> {
    await this.client.close();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async checkDatabaseExists(): Promise<boolean> {
    const admin = this.client.db().admin();
    const { databases } = await admin.listDatabases();
    const exists = databases.some((db) => db.name === this.dbName);

    if (exists) {
      emit("frmz-mongodb:DatabaseConnected");
      console.log(`\x1b[36m[MongoDB]\x1b[0m Connected to "${this.dbName}".`);
    } else {
      console.error(`\x1b[36m[MongoDB]\x1b[31m[ERROR]\x1b[0m Cannot connect to "${this.dbName}".`);
    }

    this.connected = exists;
    return exists;
  }

  private getCollection(collectionName: string) {
    if (!this.db) throw new Error("Database not initialized");
    return this.db.collection(collectionName);
  }

  async getAll(collection: string, limit = 100): Promise<WithId<Document>[]> {
    return this.getCollection(collection).find().limit(limit).toArray();
  }

  async findOne(collection: string, query: any): Promise<WithId<Document> | null> {
    return this.getCollection(collection).findOne(query);
  }

  async findMany(collection: string, query: any): Promise<WithId<Document>[]> {
    return this.getCollection(collection).find(query).toArray();
  }

  async insertOne(collection: string, doc: any): Promise<InsertOneResult<Document>> {
    return this.getCollection(collection).insertOne(doc);
  }

  async insertMany(collection: string, docs: any[]): Promise<InsertManyResult<Document>> {
    return this.getCollection(collection).insertMany(docs);
  }

  // Changed here: update receives a full update object, no forced $inc
  async updateOne(collection: string, query: any, update: any): Promise<UpdateResult> {
    return this.getCollection(collection).updateOne(query, update);
  }

  async updateMany(collection: string, query: any, update: any): Promise<UpdateManyResult> {
    return this.getCollection(collection).updateMany(query, update);
  }

  async setOne(collection: string, query: any, data: any): Promise<UpdateResult> {
    return this.getCollection(collection).updateOne(query, { $set: data });
  }

  async setMany(collection: string, query: any, data: any): Promise<UpdateManyResult> {
    return this.getCollection(collection).updateMany(query, { $set: data });
  }

  async deleteOne(collection: string, query: any): Promise<DeleteResult> {
    return this.getCollection(collection).deleteOne(query);
  }

  async deleteMany(collection: string, query: any): Promise<DeleteResult> {
    return this.getCollection(collection).deleteMany(query);
  }

  async exists(collection: string, query: any): Promise<boolean> {
    const doc = await this.getCollection(collection).findOne(query);
    return !!doc;
  }

  async count(collection: string, query: any): Promise<number> {
    return this.getCollection(collection).countDocuments(query);
  }

  async findWithLimit(collection: string, query: any, limit = 100): Promise<WithId<Document>[]> {
    return this.getCollection(collection).find(query).limit(limit).toArray();
  }
}

const mongo = new MongoDB(url, dbName);

(async () => {
  try {
    await mongo.connect();
    await mongo.checkDatabaseExists();
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
  }
})();

const formatDoc = (doc: WithId<Document> | null): Record<string, any> | null => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { _id: _id.toString(), ...rest };
};

/* const handleResult = <T>(result: T | null, error?: string | null): Result<T> => {
  if (error) {
    console.error("Error:", error);
    return { success: false, error };
  }
  if (result) return { success: true, data: result };
  return { success: false, error: "No results found" };
}; */

async function withErrorHandling<T>(
  operation: () => Promise<T>,
  callback?: (error: boolean, result: T | { error: string }) => void
): Promise<T | { error: string }> {
  if (!mongo.isConnected()) {
    const error = { error: "Not connected to MongoDB" };
    if (typeof callback === "function") callback(true, error);
    return error;
  }

  try {
    const result = await operation();
    if (typeof callback === "function") callback(false, result);
    return result;
  } catch (err: any) {
    const error = { error: err?.message || String(err) };
    if (typeof callback === "function") callback(true, error);
    return error;
  }
}



// Exported API

export const isConnected = () => mongo.isConnected();

export async function InsertOne(
  params: { collection: string; document: Record<string, any> },
  callback?: (error: boolean, result: Result<InsertOneResult<Document>>) => void
) {
  return withErrorHandling(() => mongo.insertOne(params.collection, params.document), callback);
}

export async function InsertMany(
  params: { collection: string; data: Record<string, any>[] },
  callback?: (error: boolean, result: Result<string[]>) => void
) {
  if (!mongo.isConnected()) {
    const errorResult = { success: false, error: "Not connected to MongoDB" };
    if (callback) return callback(true, errorResult), errorResult;
    return errorResult;
  }

  try {
    const result = await mongo.insertMany(params.collection, params.data);
    const ids = Object.values(result.insertedIds).map((id) => id.toString());
    const successResult = { success: true, data: ids };
    if (callback) return callback(false, successResult), successResult;
    return successResult;
  } catch (error: any) {
    const errorResult = { success: false, error: String(error) };
    if (callback) return callback(true, errorResult), errorResult;
    return errorResult;
  }
}

export async function FindOne(
  params: { collection: string; query: Record<string, any> },
  callback?: (error: boolean, result: Result<Record<string, any> | null>) => void
) {
  return withErrorHandling(async () => {
    const result = await mongo.findOne(params.collection, params.query);
    return formatDoc(result);
  }, callback);
}

   





export async function FindMany(
  params: { collection: string; query: Record<string, any> },
  callback?: (error: boolean, result: Result<Record<string, any>[]>) => void
) {
  return withErrorHandling(async () => {
    const results = await mongo.findMany(params.collection, params.query);
    return results.map(formatDoc);
  }, callback);
}

export async function FindAll(
  params: { collection: string; limit?: number },
  callback?: (error: any, data?: Record<string, any>[]) => void
) {
  try {
    const results = await mongo.getAll(params.collection, params.limit ?? 100);
    const formatted = results.map(formatDoc);
    if (callback) return callback(null, formatted);
    return formatted;

    
  } catch (error) {
    if (callback) return callback(error);
    throw error;
  }
}

export async function UpdateOne(
  params: { collection: string; query: Record<string, any>; newData: object },
  callback?: (error: boolean, result: Result<UpdateResult>) => void
) {
  // Expect newData to be a MongoDB update object, e.g. { $set: {...} } or { $inc: {...} }
  return withErrorHandling(() => mongo.updateOne(params.collection, params.query, params.newData), callback);
}

export async function UpdateMany(
  params: { collection: string; query: Record<string, any>; newData: object },
  callback?: (error: boolean, result: Result<UpdateManyResult>) => void
) {
  return withErrorHandling(() => mongo.updateMany(params.collection, params.query, params.newData), callback);
}

export async function SetOne(
  params: { collection: string; query: Record<string, any>; newData: object },
  callback?: (error: boolean, result: Result<UpdateResult>) => void
) {
  return withErrorHandling(() => mongo.setOne(params.collection, params.query, params.newData), callback);
}

export async function SetMany(
  params: { collection: string; query: Record<string, any>; newData: object },
  callback?: (error: boolean, result: Result<UpdateManyResult>) => void
) {
  return withErrorHandling(() => mongo.setMany(params.collection, params.query, params.newData), callback);
}

export async function DeleteOne(
  params: { collection: string; query: Record<string, any> },
  callback?: (error: boolean, result: Result<DeleteResult>) => void
) {
  return withErrorHandling(() => mongo.deleteOne(params.collection, params.query), callback);
}

export async function DeleteMany(
  params: { collection: string; query: Record<string, any> },
  callback?: (error: boolean, result: Result<DeleteResult>) => void
) {
  return withErrorHandling(() => mongo.deleteMany(params.collection, params.query), callback);
}

export async function CheckOne(
  params: { collection: string; query: Record<string, any> },
  callback?: (exists: boolean) => void
) {
  try {
    const exists = await mongo.exists(params.collection, params.query);
    if (callback) callback(exists);
    return exists;
  } catch (error) {
    if (callback) callback(false);
    throw error;
  }
}

export async function Count(
  params: { collection: string; query: Record<string, any> },
  callback?: (error: any, count?: number) => void
) {
  try {
    const count = await mongo.count(params.collection, params.query);
    if (callback) callback(null, count);
    return count;
  } catch (error) {
    if (callback) callback(error);
    throw error;
  }
}

export async function FindSpec(
  params: { collection: string; query: Record<string, any>; limit?: number },
  callback?: (error: any, data?: Record<string, any>[]) => void
) {
  try {
    const results = await mongo.findWithLimit(params.collection, params.query, params.limit ?? 100);
    const formatted = results.map(formatDoc);
    if (callback) return callback(null, formatted);
    return formatted;
  } catch (error) {
    if (callback) return callback(error);
    throw error;
  }
}
