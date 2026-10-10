// Creates an admin account. There is deliberately no public admin sign-up.
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-password' npm run create-admin
// (reads MONGODB_URI / MONGO_URI from .env)
require("dotenv").config();
const mongoose = require("mongoose");
const { AuthUser } = require("../models/authuserModel");
const { Role } = require("../models/roleModel");

const run = async () => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set ADMIN_EMAIL to a valid email");
  if (password.length < 12) throw new Error("Set ADMIN_PASSWORD to at least 12 characters");

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  if (await AuthUser.exists({ useremail: email })) {
    throw new Error(`An account with ${email} already exists`);
  }
  const role = await Role.create({ rolename: "admin" });
  await AuthUser.create({ useremail: email, password, role: role._id });
  console.log(`Admin account created for ${email}. Log in with it on the normal login page.`);
};

run()
  .catch((error) => {
    console.error("Could not create admin:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
