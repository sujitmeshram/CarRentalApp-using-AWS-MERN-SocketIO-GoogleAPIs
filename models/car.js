const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  make: {
    type: String,
  },
  model: {
    type: String,
  },
  year: {
    type: Number,
  },
  type: {
    type: String,
  },
  pricePerWeek: {
    type: Number,
  },

  pricePerHour: {
    type: Number,
  },
  image: [
    {
      imageUrl: {
        type: String,
      },
    },
  ],
  location: [
    {
      address: {
        type: String,
      },
      city: {
        type: String,
      },

      state: {
        type: String,
      },
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

mongoose.exports = mongoose.model("Car", carSchema);
