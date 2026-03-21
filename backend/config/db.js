const mongoose = require('mongoose');
const dns = require('dns');
const { Resolver } = require('dns').promises;

// Use Google + Cloudflare DNS
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 10000;

async function buildDirectURI() {
  try {
    // Manually resolve SRV to get actual host:port pairs
    const uri = process.env.MONGO_URI;
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\//);
    if (!match) return uri;

    const [, user, pass, host] = match;
    const dbPart = uri.split(`${host}/`)[1] || 'anvi-stay?retryWrites=true&w=majority';

    const records = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    if (!records || records.length === 0) return null;

    const hosts = records.map(r => `${r.name}:${r.port}`).join(',');
    return `mongodb://${user}:${pass}@${hosts}/${dbPart}&ssl=true&authSource=admin`;
  } catch {
    return null;
  }
}

const connectDB = async (attempt = 1) => {
  try {
    // First try direct SRV-resolved connection
    const directURI = await buildDirectURI();
    const uri = directURI || process.env.MONGO_URI;

    if (directURI) {
      console.log(`[MongoDB] Using resolved direct connection (attempt ${attempt}/${MAX_RETRIES})`);
    } else {
      console.log(`[MongoDB] Trying SRV connection (attempt ${attempt}/${MAX_RETRIES})`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`[MongoDB] ✅ Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB] Connection error (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
    if (attempt < MAX_RETRIES) {
      console.log(`[MongoDB] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error('[MongoDB] ❌ All connection attempts failed. Exiting.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
