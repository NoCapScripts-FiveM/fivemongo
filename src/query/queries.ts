import {
  UpdateResult,
  WithId,
  Document,
  MongoClient,
  MongoClientOptions,
  Db
} from "mongodb";

/* @ts-ignore */
const url: string = GetConvar("mongoCredentials", "none");
/* @ts-ignore */
const dbName: string = GetConvar("mongoDatabase", "none");
/* @ts-ignore */
RegisterNetEvent("frmz-mongodb:DatabaseConnected");

type UpdatedDocument = WithId<Document> & { _id: string };

class MongoDB {
  client: MongoClient;
  dbName: string;
  connected: boolean = false;
  db: Db | null = null;

  constructor(url: string, dbName: string) {
    if (url === "none" || dbName === "none")
      throw new Error(
        'Both `url` and `dbName` must be provided and cannot be "none".'
      );

    this.dbName = dbName;
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as MongoClientOptions);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.connected = true;
  }

  async close() {
    await this.client.close();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async isDBexist(): Promise<boolean> {
    const admin = this.client.db().admin();
    const dbInfo = await admin.listDatabases();
    const isDbExist = dbInfo.databases.some((db) => db.name === this.dbName);
    this.connected = isDbExist;

    if (isDbExist) {
      emit("frmz-mongodb:DatabaseConnected");
      console.log(`\x1b[36m[MongoDB]\x1b[0m Connected to "${this.dbName}".`);
    } else {
      console.log(
        `\x1b[36m[MongoDB]\x1b[31m[ERROR]\x1b[0m Cannot connect to "${this.dbName}".`
      );
    }

    return isDbExist;
  }

  collection(name: string) {
    if (!this.db) throw new Error("Database not initialized.");
    return this.db.collection(name);
  }

  async findOne(collection: string, query: any) {
    return this.collection(collection).findOne(query);
  }

  async findMany(collection: string, query: any) {
    return this.collection(collection).find(query).toArray();
  }

  async insertOne(collection: string, data: any) {
    return this.collection(collection).insertOne(data);
  }

  async insertMany(collection: string, data: any[]) {
    return this.collection(collection).insertMany(data);
  }

  async updateOne(collection: string, query: any, newData: any) {
    return this.collection(collection).updateOne(query, { $set: newData });
  }

  async updateMany(collection: string, query: any, newData: any) {
    return this.collection(collection).updateMany(query, { $set: newData });
  }

  async deleteOne(collection: string, query: any) {
    return this.collection(collection).deleteOne(query);
  }

  async deleteMany(collection: string, query: any) {
    return this.collection(collection).deleteMany(query);
  }

  async checkOne(collection: string, query: any) {
    const result = await this.collection(collection).findOne(query);
    return !!result;
  }
}

const mongo = new MongoDB(url, dbName);

// 🔌 Initialize and verify DB
(async () => {
  try {
    await mongo.connect();
    await mongo.isDBexist();
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
  }
})();

// ✅ Common Utility Handlers

const handleCallbackAndError = (
  result:
    | string
    | string[]
    | UpdatedDocument
    | Document
    | (UpdatedDocument | null)[]
    | UpdateResult
    | null,
  callback?: Function
) => {
  if (!mongo.isConnected()) {
    return callback
      ? callback(true, "Not connected to MongoDB")
      : { error: true, reason: "Not connected to MongoDB" };
  }
  return callback ? callback(false, result) : { error: false, result };
};

const handleError = (error: unknown, callback?: Function) =>
  callback ? callback(true, error) : { error: true, result: error };

const formatResult = (result: WithId<Document> | null) =>
  result ? { ...result, _id: result._id.toString() } : null;

// ✅ Exports

exports("isConnected", () => {
  return mongo.isConnected();
});

export async function InsertOne(
  collection: string,
  query: string,
  callback?: Function
) {
  try {
    const result = await mongo.insertOne(collection, query);
    return handleCallbackAndError(result.insertedId.toString(), callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function InsertMany(
  collection: string,
  query: string[],
  callback?: Function
) {
  try {
    const result = await mongo.insertMany(collection, query);
    return handleCallbackAndError(
      Object.values(result.insertedIds).map((v) => v.toString()),
      callback
    );
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function FindOne(
  collection: string,
  query: string,
  callback?: Function
) {
  try {
    const result = await mongo.findOne(collection, query);
    return handleCallbackAndError(formatResult(result), callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function FindMany(
  collection: string,
  query: string,
  callback?: Function
) {
  try {
    const result = await mongo.findMany(collection, query);
    return handleCallbackAndError(result.map(formatResult), callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function UpdateOne(
  collection: string,
  query: string,
  newData: object,
  callback?: Function
) {
  try {
    const result = await mongo.updateOne(collection, query, newData);
    return handleCallbackAndError(result, callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function UpdateMany(
  collection: string,
  query: string,
  newData: object,
  callback?: Function
) {
  try {
    const result = await mongo.updateMany(collection, query, newData);
    return handleCallbackAndError(result, callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function DeleteOne(
  collection: string,
  query: string,
  callback?: Function
) {
  try {
    const result = await mongo.deleteOne(collection, query);
    return handleCallbackAndError(result, callback);
  } catch (error) {
    return handleError(error, callback);
  }
}

export async function DeleteMany(
  collection: string,
  query: string,
  callback?: Function
) {
  try {
    const result = await mongo.deleteMany(collection, query);
    return handleCallbackAndError(result, callback);
  } catch (error) {
    return handleError(error, callback);
  }
}



// Returns boolean depends on data existing
export async function CheckOne(
    collection: string,
    query: string,
    callback?: Function
) {
    try  {
        const res = await mongo.checkOne(collection, query);
        return res
    } catch (error) {
        return handleError(error, callback);
    }
}
