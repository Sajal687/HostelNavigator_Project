// Canonical listing vocabularies shared by search filters and the AI query parser.
// FACILITIES must stay in sync with the owner sign-up form (frontend CreateNewHostel.js).
const FACILITIES = [
  "Table",
  "Chair",
  "Bed (without mattress)",
  "Book Rack",
  "Almirah",
  "Kitchen",
  "Separate Bathroom",
  "Library",
  "Laundry",
  "24/7 Electricity",
  "Water Supply",
  "Dining Hall",
];

const ROOM_TYPES = ["single", "double", "triple", "multi-sharing"];

const GENDER_TYPES = ["Boys", "Girls", "Both"];

module.exports = { FACILITIES, ROOM_TYPES, GENDER_TYPES };
