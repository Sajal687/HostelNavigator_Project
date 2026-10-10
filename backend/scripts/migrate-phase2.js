// One-off, idempotent Phase 2 migration. Safe to re-run.
//   - backfills status / isVerified / slug on existing hostels
//   - creates any missing indexes (incl. the 2dsphere index) for every model
// Usage: npm run migrate:phase2   (reads MONGODB_URI / MONGO_URI from .env)
require("dotenv").config();
const mongoose = require("mongoose");
const { Hostel } = require("../models/hostelModel");
require("../models/userModel");
require("../models/reviewModel");
require("../models/inquiryModel");

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  const statusResult = await Hostel.updateMany(
    { status: { $exists: false } },
    { $set: { status: "published" } }
  );
  const verifiedResult = await Hostel.updateMany(
    { isVerified: { $exists: false } },
    { $set: { isVerified: false } }
  );

  // Slugs need per-document values; only project the fields we need (skip image buffers).
  const withoutSlug = await Hostel.find(
    { slug: { $exists: false } },
    { hostel_name: 1, hostel_id: 1 }
  ).lean();
  for (const hostel of withoutSlug) {
    await Hostel.updateOne(
      { _id: hostel._id },
      { $set: { slug: `${Hostel.slugify(hostel.hostel_name)}-${hostel.hostel_id}` } }
    );
  }

  // createIndexes only adds missing indexes; it never drops existing ones (unlike syncIndexes).
  for (const name of mongoose.modelNames()) {
    await mongoose.model(name).createIndexes();
  }

  console.log(
    `Backfilled status on ${statusResult.modifiedCount}, isVerified on ${verifiedResult.modifiedCount}, ` +
      `slug on ${withoutSlug.length} hostel(s). Indexes ensured for: ${mongoose.modelNames().join(", ")}`
  );
};

run()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
