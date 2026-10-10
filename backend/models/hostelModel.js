const mongoose = require("mongoose");

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const hostelSchema = new mongoose.Schema(
  {
    authUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
    },
    hostel_id: {
      type: String,
      required: true,
      unique: true,
    },
    hostel_name: {
      type: String,
      required: true,
    },
    // URL-friendly identifier, generated from the name and hostel_id.
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    hostel_address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postal_code: {
        type: String,
        required: true,
      },
    },
    // Free-text owner content; the AI summary is extracted from these.
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    house_rules: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    // Cached AI summary, regenerated only when the listing content it was built from changes.
    ai_summary: {
      data: mongoose.Schema.Types.Mixed,
      sourceHash: String,
      model: String,
      generatedAt: Date,
    },
    // GeoJSON point: coordinates are [longitude, latitude]. Optional so listings without
    // coordinates are simply left out of radius searches (2dsphere indexes are sparse).
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator: (coords) =>
            coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90 && coords[1] <= 90,
          message: "location.coordinates must be [longitude, latitude]",
        },
      },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Owner-controlled availability toggle shown on cards and the detail page.
    has_vacancy: {
      type: Boolean,
      default: true,
    },
    // Denormalised from approved reviews (see services/ratings.js).
    review_count: {
      type: Number,
      default: 0,
    },
    hostel_gender_type: {
      type: String,
      enum: ["Boys", "Girls", "Both"],
      required: true,
    },
    hostel_rent: {
      type: Number,
      required: true,
    },
    hostel_facilities: {
      type: Array,
      required: true,
    },
    hostel_rating: {
      type: Number,
      required: true,
    },
    // CDN image URLs (Cloudinary/S3). Preferred over hostel_img for all new uploads.
    images: {
      type: [String],
      validate: {
        validator: (urls) => urls.every((url) => /^https?:\/\/\S+$/i.test(url)),
        message: "images must be http(s) URLs",
      },
    },
    // LEGACY: raw image binaries stored in MongoDB. Kept only until existing images are
    // migrated to CDN URLs - do not add new data here (M0 tier has a 512 MB ceiling).
    hostel_img: [
      {
        data: {
          type: Buffer,
          required: true,
        },
        contentType: {
          type: String,
          required: true,
        },
      },
    ],
    owner_name: {
      type: String,
      required: true,
    },
    owner_phone_number: {
      type: String,
      required: true,
    },
    owner_email: {
      type: String,
      required: true,
    },
    all_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hostel_rooms: 
      {
        room_number: {
          type: String,
          required: true,
        },
        room_capacity: {
          type: Array,
          required: true,
          // enum: ["Single", "Double", "Triple" , "Multi-Sharing"], 
        },
      }
  },
  {
    timestamps: true,
  }
);

hostelSchema.pre("validate", function (next) {
  if (!this.slug && this.hostel_name && this.hostel_id) {
    this.slug = `${slugify(this.hostel_name)}-${this.hostel_id}`;
  }
  // Drop an incomplete GeoJSON object; a Point without coordinates breaks the 2dsphere index.
  if (this.location && !this.location.coordinates) {
    this.location = undefined;
  } else if (this.location && !this.location.type) {
    this.location.type = "Point";
  }
  next();
});

hostelSchema.index({ location: "2dsphere" });
hostelSchema.index({ "hostel_address.city": 1, hostel_rent: 1 });
hostelSchema.index({ status: 1, isVerified: 1 });

hostelSchema.statics.slugify = slugify;

exports.Hostel = mongoose.model("Hostel", hostelSchema);