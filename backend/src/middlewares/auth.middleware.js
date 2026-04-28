import jwt from "jsonwebtoken";  
import {LoanOfficer} from "../models/loanOfficer.model.js"
import {Applicant} from "../models/applicant.model.js"  
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let user;
    if (decodedToken.role === "loanOfficer") {
        user = await LoanOfficer.findById(decodedToken._id).select("-password -refreshToken");
    } else if (decodedToken.role === "applicant") {
        user = await Applicant.findById(decodedToken._id).select("-password -refreshToken");
    }

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    req.user.role = decodedToken.role;
    next();
});

export { verifyJWT };
