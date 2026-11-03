import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { env } from './env.js';

interface CloudinaryResponse {
  url: string;
  public_id: string;
}

const uploadOnCloudinary = async (
  LocalFilePath: string,
  folder: string,
): Promise<CloudinaryResponse | false> => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_KEY,
    api_key: env.API_KEY,
    api_secret: env.API_SECRET,
    timeout: 120000,
  });

  if (!(LocalFilePath || folder)) {
    return false;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const response = await cloudinary.uploader.upload(LocalFilePath, {
    folder: `EnglishCoaching/${folder}`,
    resource_type: 'image',
    timestamp,
  });

  if (!response) {
    return false;
  }

  fs.unlinkSync(LocalFilePath);
  return { url: response.url, public_id: response.public_id };
};

export { uploadOnCloudinary };
