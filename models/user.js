const mongoose = require("mongoose");
const generateSlug = require('../utils/slugGenerator');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
});

// Genera automaticamente lo slug prima del salvataggio
userSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = generateSlug(this.username);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
