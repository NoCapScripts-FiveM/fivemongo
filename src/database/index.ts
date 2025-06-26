import { MongoClient, Db } from 'mongodb';

const uri = GetConvar('mongoCredentials', '');
const isDevelopment = GetConvar('isDevelopment', 'false') === 'true';

const options = {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient | null = null;
let db: Db | null = null;
let connectingPromise: Promise<void> | null = null;

function parseDatabaseName(uri: string): string {
  // Strip query params
  const uriWithoutParams = uri.split('?')[0];
  const lastSlashIndex = uriWithoutParams.lastIndexOf('/');
  if (lastSlashIndex === -1 || lastSlashIndex === uriWithoutParams.length - 1) {
    throw new Error("MongoDB URI must contain a database name after the last '/'");
  }
  const dbName = uriWithoutParams.substring(lastSlashIndex + 1);
  if (dbName.includes('.')) {
    throw new Error("Database names cannot contain '.' characters");
  }
  return dbName;
}

async function createClient() {
  if (!uri || uri === 'null') {
    throw new Error('MongoDB connection string is missing or invalid in convar "mongoCredentials"');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MongoDB URI must start with mongodb:// or mongodb+srv://');
  }

  const databaseName = parseDatabaseName(uri);

  client = new MongoClient(uri, options);
  await client.connect();

  db = client.db(databaseName);
  console.log(`^2MongoDB connected to database: ${databaseName}^7`);
}

export async function connectToDatabase() {
  if (db) {
    // Already connected, return existing client and db
    return { client: client!, db: db! };
  }

  // If connection is already in progress, wait for it
  if (connectingPromise) {
    await connectingPromise;
    return { client: client!, db: db! };
  }

  // Otherwise, start connecting
  connectingPromise = createClient();

  try {
    await connectingPromise;
    return { client: client!, db: db! };
  } catch (error) {
    client = null;
    db = null;
    connectingPromise = null;
    throw error;
  } finally {
    connectingPromise = null;
  }
}
