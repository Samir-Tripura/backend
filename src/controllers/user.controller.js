import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




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


export { registerUser };
