const mongoose = require("mongoose");

const connectToDb = () => {
    mongoose
        .connect("mongodb://localhost:27017/NexTalk", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB connection error:", err));
};

module.exports = { connectToDb };
