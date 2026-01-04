import { MongoClient, MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables")
}

const uri = process.env.MONGODB_URI

// Quick validation to provide a clearer error when the URI is malformed
if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  throw new Error(
    "MONGODB_URI appears invalid. It must start with 'mongodb://' or 'mongodb+srv://'.\n" +
      "Example (Atlas SRV): mongodb+srv://<user>:<pass>@cluster0.xyz.mongodb.net/mydb?retryWrites=true&w=majority\n" +
      "Example (standard): mongodb://<user>:<pass>@host:27017/mydb?tls=true"
  )
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient>

// In development use a global variable so the value is preserved across module reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function buildOptions(): MongoClientOptions {
  const opts: MongoClientOptions = {
    // reasonable default server selection timeout for dev (increase to avoid premature timeouts)
    serverSelectionTimeoutMS: process.env.MONGODB_SERVER_SELECTION_TIMEOUT ? Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) : 30000,
  }

  // Allow an env toggle for insecure TLS in development only. This is UNSAFE for production.
  // Set MONGODB_TLS_ALLOW_INVALID=true to enable when connecting to self-signed or incompatible TLS endpoints for local testing.
  if (process.env.MONGODB_TLS_ALLOW_INVALID === "true") {
    // driver v4+ uses tls* options
    ;(opts as any).tls = true
    ;(opts as any).tlsAllowInvalidCertificates = true
    ;(opts as any).tlsAllowInvalidHostnames = true
  }

  return opts
}

if (!client) {
  const options = buildOptions()
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((err) => {
    // Surface a clearer error for dev logs and rethrow
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err && err.message ? err.message : err)
    throw err
  })
  if (process.env.NODE_ENV === "development") global._mongoClientPromise = clientPromise
} else {
  clientPromise = global._mongoClientPromise as Promise<MongoClient>
}

export async function getMongoClient() {
  return clientPromise
}

export async function getDb(dbName?: string) {
  const c = await getMongoClient()
  return c.db(dbName || undefined)
}
