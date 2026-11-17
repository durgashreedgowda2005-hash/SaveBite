
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            { serverSelectionTimeoutMS: 10000 }
        );

        console.log("MongoDB connected successfully!");
        console.log("Connected database:", connection.connection.name);

    } catch (error) {
        console.log("Error name:", error.name);
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);

        process.exit(1);
    }
};

module.exports = connectDB;
