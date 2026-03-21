/**
 * seed.js – Creates the first superadmin user in MongoDB.
 *
 * Usage:
 *   npm run seed
 *
 * Reads credentials from .env (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL;

    const name = process.env.ADMIN_NAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !name || !password) {
      console.error('[Seed] Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log(`[Seed] Admin "${email}" already exists – skipping.`);
    } else {
      await Admin.create({
        name,
        email,
        password,
        role: 'superadmin',
      });
      console.log(`[Seed] Superadmin created → ${email}`);
    }

    await mongoose.disconnect();
    console.log('[Seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
};

seed();
