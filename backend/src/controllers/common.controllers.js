import {LoanOfficer} from "../models/loanOfficer.model.js"
import {Applicant} from "../models/applicant.model.js"  
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        let user = await LoanOfficer.findById(userId) || await Applicant.findById(userId);

        if (!user) {
            console.error("User not found for ID:", userId);
            throw new ApiError(404, "User not found.");
        }
 
        if (!user.generateAccessToken || !user.generateRefreshToken) {
            console.error("Token generation functions missing in model");
            throw new ApiError(500, "Token generation functions not implemented.");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        console.error("Error while generating tokens:", err);
        throw new ApiError(500, "Something went wrong while generating tokens.");
    }
};

const register = asyncHandler(async (req, res, next) => {   
    const { name, email, password, role } = req.body;
    console.log("name", name, "email", email);
    
    if (!name || !email || !password || !role) {
        throw new ApiError(400, "All fields required.");
    }

    let existingUser;
    if (role === "loanOfficer") {
        existingUser = await LoanOfficer.findOne({ email });
    } else if (role === "applicant") {
        existingUser = await Applicant.findOne({ email });
    }

    if (existingUser) {
        throw new ApiError(409, "User with email already exists");
    }

    let newUser;
    if (role === "loanOfficer") {
        newUser = await LoanOfficer.create({ name, email, password });
    } else if (role === "applicant") {
        newUser = await Applicant.create({ name, email, password });
    }

    const createdUser = await (role === "loanOfficer" ? LoanOfficer : Applicant)
        .findById(newUser._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    let user = await Applicant.findOne({ email });

    if (!user) {
        user = await LoanOfficer.findOne({ email });
    }

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }

    // Validate password
    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid) {
        throw new ApiError(401, "Invalid user credentials.");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Identify user type and fetch details
    const loggedInUser = await (user instanceof LoanOfficer ? LoanOfficer : Applicant)
        .findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
};

const logout = asyncHandler(async (req, res, next) => {
    try {
        
        if (!req.user) {
            throw new ApiError(401, "Unauthorized: No user found");
        }

        const Model = req.user.role === "loanOfficer" ? LoanOfficer : Applicant;

        await Model.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: true
        };

        
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out"));
    } catch (error) {
        next(error);
    }
});

const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const role = req.user.role; 

        if (!userId) {
            return next(new ApiError(400, "User ID missing"));
        }

        let user;

        if (role === "applicant") {
            user = await Applicant.findById(userId);
        } else if (role === "loanOfficer") {
            user = await LoanOfficer.findById(userId);
        }

        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, { user, role }, "User details fetched successfully"));
    } catch (error) {
        next(new ApiError(500, "Server Error", error));
    }
};


export {
    register,
    login,
    logout,
    getUserDetails
}
