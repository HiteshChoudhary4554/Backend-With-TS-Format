import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './api-Error.js';
import { env } from './env.js';

const removeCloudinaryImage = async (publicId: string) => {
  try {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_KEY,
      api_key: env.API_KEY,
      api_secret: env.API_SECRET,
    });

    if (!publicId) {
      throw ApiError.badRequest('Provide valid publicId to delete cloudinary assets..');
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (!response) {
      return false;
    }
    return true;
  } catch {
    throw ApiError.badRequest('Error while deleting cloudinary assets..');
  }
};

export { removeCloudinaryImage };
