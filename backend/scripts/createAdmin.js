require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/UserTemp");

const createAdmin = async () => {
    try {
        if (
            !process.env.ADMIN_NAME ||
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASSWORD
        ) {
            throw new Error("Admin environment variables are missing.");
        }

        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL.trim().toLowerCase()
        });

        if (existingAdmin) {
            console.log("An account with this email already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        await User.create({
            fullName: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
            password: hashedPassword,
            role: "Admin"
        });

        console.log("Admin account created successfully!");

    } catch (error) {
        console.error("Admin creation error:", error.message);

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();