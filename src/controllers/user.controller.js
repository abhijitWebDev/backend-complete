import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // populate the data or get user details from the request like username, email, password
  // check the validation of the data like username, email, password and confirm password match or not or not empty
  // check the user already exists or not, username, email should be unique
  // check for images and check for avatar
  //if available then send to cloudinary and get the url and save it to the user.
  // create user object, create entry in database. save the user to the database
  // remove password and refreshToken from the user object.
  // check for user creation and return the response with user object

  const { username, fullName, password, email } = req.body;
  console.log(
    "username",
    username,
    "fullName",
    fullName,
    "password",
    password,
    "email",
    email
  );
  if (
    [username, fullName, password, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }
  console.log(req.files, "req.files");
  // check for images and check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
    }


//   if (!coverImageLocalPath) {
//     //Throw an error
//     throw new ApiError(400, "Cover Image is required");
//   }

  // send the images to cloudinary and get the url
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }
  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    username: username.toLowerCase(),
    password: password,
  })
  const createdUser = await User.findById(user._id)
  .select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500, "Failed to create user");
  }
  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
