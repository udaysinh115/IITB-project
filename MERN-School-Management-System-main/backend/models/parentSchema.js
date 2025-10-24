const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Parent"
    },
    linkedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "student"
    }],
    contactNumber: {
        type: String,
        required: true
    },
    relationToStudent: {
        type: String,
        required: true,
        enum: ["father", "mother", "guardian"]
    }
}, { timestamps: true });

module.exports = mongoose.model("parent", parentSchema);