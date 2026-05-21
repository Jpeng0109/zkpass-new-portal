import mongoose from "mongoose";
import dns from "node:dns";

/**
 * MongoDB Atlas / local connection via MONGODB_URI in .env
 * Optional: MONGODB_URI_STANDARD — non-SRV string if querySrv times out (VPN/DNS)
 */
export async function connectDatabase() {
  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()));
  }

  const uri = process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment");
  }

  mongoose.set("strictQuery", true);

  const opts = {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    family: 4,
    maxPoolSize: 10,
  };

  const maxAttempts = 5;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, opts);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        console.warn(`[db] Connect attempt ${attempt}/${maxAttempts} failed, retrying...`);
        await mongoose.disconnect().catch(() => {});
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  if (lastErr) throw lastErr;

  const host = mongoose.connection.host;
  const dbName = mongoose.connection.name;
  console.log(`\x1b[32m🚀 MongoDB Atlas Cloud Connected Successfully\x1b[0m (${host} · db: ${dbName})`);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log("[db] MongoDB disconnected");
}
