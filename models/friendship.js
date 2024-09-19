const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    created_at: { type: Date, default: Date.now }
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;
