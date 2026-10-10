const { FACILITIES, ROOM_TYPES, GENDER_TYPES } = require("../constants/listing");

const SORTS = ["price_asc", "price_desc", "rating_desc", "newest", "distance"];
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const DEFAULT_RADIUS_KM = 5;
const MAX_RADIUS_KM = 50;

class SearchParamError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toList = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((item) => String(item).trim())
    .filter(Boolean);

const toNumber = (value, name, { min, max } = {}) => {
  if (value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || (min !== undefined && number < min) || (max !== undefined && number > max)) {
    throw new SearchParamError(`${name} must be a number${min !== undefined ? ` between ${min} and ${max}` : ""}`);
  }
  return number;
};

const pickAllowed = (values, allowed, name) => {
  const invalid = values.filter((value) => !allowed.includes(value));
  if (invalid.length) {
    throw new SearchParamError(`Unknown ${name}: ${invalid.join(", ")}`);
  }
  return [...new Set(values)];
};

// Validates and normalises GET /api/hostels/search query params.
const parseSearchParams = (query) => {
  const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

  const params = {
    q: text(query.q, 100),
    city: text(query.city, 60),
    minRent: toNumber(query.minRent, "minRent", { min: 0, max: 1000000 }),
    maxRent: toNumber(query.maxRent, "maxRent", { min: 0, max: 1000000 }),
    gender: query.gender ? pickAllowed([String(query.gender)], GENDER_TYPES, "gender")[0] : null,
    roomTypes: pickAllowed(toList(query.roomTypes), ROOM_TYPES, "roomTypes"),
    facilities: pickAllowed(toList(query.facilities), FACILITIES, "facilities"),
    lat: toNumber(query.lat, "lat", { min: -90, max: 90 }),
    lng: toNumber(query.lng, "lng", { min: -180, max: 180 }),
    radiusKm: toNumber(query.radiusKm, "radiusKm", { min: 0.1, max: MAX_RADIUS_KM }) ?? DEFAULT_RADIUS_KM,
    page: Math.floor(toNumber(query.page, "page", { min: 1, max: 1000 }) ?? 1),
    limit: Math.floor(toNumber(query.limit, "limit", { min: 1, max: MAX_LIMIT }) ?? DEFAULT_LIMIT),
    sort: query.sort ? String(query.sort) : null,
  };

  if ((params.lat === null) !== (params.lng === null)) {
    throw new SearchParamError("lat and lng must be provided together");
  }
  params.hasLocation = params.lat !== null;

  if (params.sort && !SORTS.includes(params.sort)) {
    throw new SearchParamError(`sort must be one of: ${SORTS.join(", ")}`);
  }
  if (params.sort === "distance" && !params.hasLocation) {
    throw new SearchParamError("sort=distance requires lat and lng");
  }
  params.sort = params.sort || (params.hasLocation ? "distance" : "rating_desc");

  if (params.minRent !== null && params.maxRent !== null && params.minRent > params.maxRent) {
    throw new SearchParamError("minRent cannot be greater than maxRent");
  }
  return params;
};

const buildMatch = (params) => {
  // `null` also matches listings created before the status field existed.
  const match = { status: { $in: ["published", null] } };

  if (params.city) {
    match["hostel_address.city"] = { $regex: `^${escapeRegex(params.city)}$`, $options: "i" };
  }
  if (params.minRent !== null || params.maxRent !== null) {
    match.hostel_rent = {};
    if (params.minRent !== null) match.hostel_rent.$gte = params.minRent;
    if (params.maxRent !== null) match.hostel_rent.$lte = params.maxRent;
  }
  // "Who can stay here": co-ed hostels are included for boys and for girls.
  if (params.gender === "Boys" || params.gender === "Girls") {
    match.hostel_gender_type = { $in: [params.gender, "Both"] };
  } else if (params.gender === "Both") {
    match.hostel_gender_type = "Both";
  }
  if (params.roomTypes.length) {
    match["hostel_rooms.room_capacity"] = { $in: params.roomTypes };
  }
  if (params.facilities.length) {
    match.hostel_facilities = { $all: params.facilities };
  }
  if (params.q) {
    const pattern = { $regex: escapeRegex(params.q), $options: "i" };
    match.$or = [
      { hostel_name: pattern },
      { "hostel_address.city": pattern },
      { "hostel_address.street": pattern },
    ];
  }
  return match;
};

const SORT_STAGES = {
  price_asc: { hostel_rent: 1, _id: 1 },
  price_desc: { hostel_rent: -1, _id: 1 },
  rating_desc: { hostel_rating: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
  distance: { distanceMeters: 1, _id: 1 },
};

const buildSearchPipeline = (params) => {
  const match = buildMatch(params);
  const pipeline = params.hasLocation
    ? [
        {
          // $geoNear must be the first stage; it uses the 2dsphere index and adds the distance.
          $geoNear: {
            near: { type: "Point", coordinates: [params.lng, params.lat] },
            distanceField: "distanceMeters",
            maxDistance: params.radiusKm * 1000,
            spherical: true,
            query: match,
          },
        },
      ]
    : [{ $match: match }];

  pipeline.push({
    $facet: {
      data: [
        { $sort: SORT_STAGES[params.sort] },
        { $skip: (params.page - 1) * params.limit },
        { $limit: params.limit },
        // Cards only need two images; skip the rest of the legacy image binaries.
        { $addFields: { hostel_img: { $slice: [{ $ifNull: ["$hostel_img", []] }, 2] } } },
        { $project: { all_users: 0, authUser: 0, ai_summary: 0 } },
      ],
      total: [{ $count: "count" }],
    },
  });
  return pipeline;
};

const toBase64 = (data) => {
  if (!data) return null;
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer || data);
  return bytes.toString("base64");
};

// Search results send images as base64 strings (much smaller than JSON byte arrays).
const formatSearchResult = (hostel, { maxImages = 2 } = {}) => {
  const { distanceMeters, hostel_img: images = [], ...rest } = hostel;
  return {
    ...rest,
    hostel_img: images.slice(0, maxImages).map((img) => toBase64(img.data)).filter(Boolean),
    distanceKm: typeof distanceMeters === "number" ? Math.round(distanceMeters / 100) / 10 : null,
  };
};

module.exports = {
  SearchParamError,
  parseSearchParams,
  buildSearchPipeline,
  formatSearchResult,
};
