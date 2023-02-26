const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  facebook: {
    type: String,
  },
  google: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  image: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
  },
  email: {
    type: String,
  },

  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
