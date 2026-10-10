// Must match backend/constants/listing.js - search filters are validated against it.
export const FACILITIES = [
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

export const ROOM_TYPES = [
  { id: "single", label: "Single" },
  { id: "double", label: "Double" },
  { id: "triple", label: "Triple" },
  { id: "multi-sharing", label: "Multi-Sharing" },
];

export const GENDER_OPTIONS = [
  { id: "Boys", label: "Boys" },
  { id: "Girls", label: "Girls" },
  { id: "Both", label: "Co-ed" },
];

export const SORT_OPTIONS = [
  { id: "rating_desc", label: "Top rated" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "newest", label: "Newest" },
  { id: "distance", label: "Nearest", needsLocation: true },
];
