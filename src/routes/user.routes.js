import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
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




export default router;