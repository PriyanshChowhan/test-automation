import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("file has been uploaded succesfully", response.url)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath)
    } 
}

const deleteFromCloudinary = async(filePath) => {
    if (!filePath) {
        throw new Error("File path is required to delete from Cloudinary.");
    }
    try {
        const publicId = filePath.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error("Failed to delete file from Cloudinary.");
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}