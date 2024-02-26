import express from 'express';
import { loginUser, logoutUser, registerUser, refreshAccessToken,changeCurrentPassword,updateUserAvatar,updateUserCoverImage, updateAccountDetails, getWatchHistory, getUserChannelProfile, getCurrentUser } from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/register").post(
    // multer middleware to upload the images
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1},
    ]),
    registerUser
    );
// login route
router.route("/login").post(loginUser);

// secure this route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);









export default router;