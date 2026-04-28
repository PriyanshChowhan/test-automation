import mongoose, { Schema } from "mongoose";

const loanApplicationSchema = new Schema(
{
    Applicant_Id: {
        type: Schema.Types.ObjectId,
        ref: "applicant",
        required: true,
    },
    Applicant_name: {
        type: String
    },
    number_of_dependents: {
        type: Number,
        required: true,
    },
    education: {
        type: String,
        enum: ["Graduate", "Not Graduate"],
        required: true,
    },
    self_employed: {
        type: Boolean,
        required: true,
    },
    income_annum: {
        type: Number,
        required: true,
    },
    loan_amount: {
        type: Number,
        required: true,
    },
    loan_term: {
        type: Number, 
        required: true,
    },
    cibil_score: {
        type: Number,
        required: true,
        min: 300,
        max: 900,
    },
    residential_assets_value: {
        type: Number,
        required: true,
    },
    commercial_assets_value: {
        type: Number,
        required: true,
    },
    luxury_assets_value: {
        type: Number,
        required: true,
    },
    bank_asset_value: {
        type: Number,
        required: true,
    },
    loan_status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    // encrypted_file_path: {
    //     type: String
    // },
    // video_kyc: {
    //     type: String
    // },
    debt:{
        type: Number
    },
    ai_analysis: {
        type: Schema.Types.Mixed,
        default: null,
    }

},
{
    timestamps: true,
}
);

export const LoanApplication = mongoose.model("LoanApplication", loanApplicationSchema);
