import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/docucanvas";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

let lastFailureTime = 0;
const FAILURE_COOLDOWN_MS = 15000; // 15 seconds cooldown before retrying connection

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt recently failed, skip waiting and fail fast to use fallback
  const now = Date.now();
  if (now - lastFailureTime < FAILURE_COOLDOWN_MS) {
    throw new Error("MongoDB recently failed to connect; using fallback store");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        lastFailureTime = 0;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        lastFailureTime = Date.now();
        console.warn("MongoDB connection offline, using fallback store:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}
