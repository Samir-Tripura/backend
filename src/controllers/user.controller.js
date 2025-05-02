import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const registerUser = asyncHandler( async (req, res) =>{
   //get user details from frontend
   //validation -not empty
   //check if user already exists: userName,email
   // check for image, check for avatar
   //upload them to cloudinary, check for avatar
   //create user object -  create entry in db
   //remove password and refresh token field from response
   // check for user creation
   // return response.





    //validation -not empty
    const {username, email, fullname, password} = req.body
        if (fullname === "") {
            throw new ApiError(400, "fullname is required")
        }
        
        if (password === "") {
            throw new ApiError(400, "password is required")
        }
        
        if (email === "") {
            throw new ApiError(400, "email is required")
        }
        
        if (username === "") {
            throw new ApiError(400, "username is required")
        }


         //check if user already exists: userName,email
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser){
            throw new ApiError(409, "user  with email or username already exists")
        }



        // files path
        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }


        // check for image, check for avatar
        if(!avatarLocalPath){
            throw new ApiError(400, "avatar files is required")
        }
        
    


        //upload on cloudinary
        const avatar =  await uploadOnCloudinary(avatarLocalPath)
        const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

        //check avatar properly uploded on cloudinary or not
        if(!avatar){
             throw new ApiError(400, "avatar is required")
        }


         //create user object -  create entry in db
         const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
         })


         //remove password and refresh token field from response
         const createdUser = await User.findById(user._id).select("-password -refreshToken")

         
         // check for user creation
         if (!createdUser){
            throw new ApiError(500, "somethings went wrong while registering the user.")
         }


         // return response
         return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered succsessfully")
         )  
})





//login


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

        
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access token")
        
    }
}

const loginUser = asyncHandler(async (req, res) =>{
    //req body -> data
    // access using username or email
    //find the user
    //password check
    //access and refress token
    //send cookie


    //req body -> data
    const {email, username, password} = req.body
    console.log(email);

     // access using username or email
    if(!(username || email)){
        throw new ApiError(400,"user name or password is required")
    }

    //find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new ApiError(401, " password incorrect")
    } 

    //access and refress token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    //send cookie option
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken,
                refreshToken
            }, 
            "user logged in successfully")
    )
})



// user logout

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
         {
             $set: {
                refreshToken: undefined
            }
        },
        {
                new: true,
        }     
    )
    
    //send cookie option
    const options = {
        httpOnly: true,
        secure: true,
    }
    //clear cookies
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "user logged out")
    )

})

// refresh access token
const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if (! incomingRefreshToken){
    throw new ApiError (401, "unauthorized request")
}

try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.ACCESS_TOKEN_SECRET,
    )
    
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
        throw new ApiError(401, "invalid refresh token")
    }
    
    if (incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, " refresh token epired")
    }
    
    const options = {
        httpOnly: true,
        secure: true,
    }
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(200,
             {accessToken, newRefreshToken},
        )
    )
} 
catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
    
}

})




export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
