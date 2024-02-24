import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
const uploadOnCloudinary = async (localFilePath) => {
    console.log("localFilePath from cloudinary line 12", localFilePath);
    try {
        if(!localFilePath) throw new Error("File path is required");
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
         });
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath); // remove the locally saved temp file
        return response;
        
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload operation got failed
        } else {
            console.log(`File does not exist: ${localFilePath}`);
        }
        
    }

};


  export {uploadOnCloudinary}