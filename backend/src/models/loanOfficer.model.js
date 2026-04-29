import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // ✅ Fix: Import bcrypt

const loanOfficerSchema = new Schema(
{   
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
},
{
    timestamps: true,
}
);

// loanOfficerSchema.pre("save", async function(next) {
//     if (!this.isModified("password")) return;

//     this.password = await bcrypt.hash(this.password, 10);
// });

loanOfficerSchema.methods.isPasswordCorrect = function(password) {
    return password === this.password;
};

loanOfficerSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: "loanOfficer"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

loanOfficerSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const LoanOfficer = mongoose.model("LoanOfficer", loanOfficerSchema);

