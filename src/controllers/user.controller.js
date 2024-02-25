import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
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
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// generating token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generate refresh and access token"
    );
  }
};
const loginUser = asyncHandler(async (req, res) => {
  // get the username or email and password from the request body
  // check the username or email and password are not emptt
  // check the user exists or not
  // check the password is correct or not
  // generate access and refresh token
  // send the response with tokens in the cookies

  const { username, email, password } = req.body;
  // check the username or email and password are not empty
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }
  // check the user exists or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // check the user exists or not
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check the password is not empty
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // check the password is correct or not
  const isPasswordValid = await user.isPasswordCorrect(password);
  // is password valid
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send the response with tokens in the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("req.user", req.user.id);
  User.findByIdAndUpdate(req.user._id, 
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
    );

    const options = {
      httpOnly: true,
      secure: true,
      
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));

});

export { registerUser, loginUser, logoutUser };
