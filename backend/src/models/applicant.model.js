import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";  

const applicantSchema = new Schema(
{
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    number_of_prev_loans: {
        type: Number
    },
    prev_loans: [
        {
          type: Schema.Types.ObjectId,
          ref: "LoanApplication",
        },
    ]
},
{
    timestamps: true,
}
);

// applicantSchema.pre("save", async function(next) {
//     if(!this.isModified("password")) return;

//     this.password = await bcrypt.hash(this.password, 10)
// });

applicantSchema.methods.isPasswordCorrect = function (password){
    return password === this.password;
};

applicantSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: "applicant"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

applicantSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const Applicant = mongoose.model("Applicant", applicantSchema);
