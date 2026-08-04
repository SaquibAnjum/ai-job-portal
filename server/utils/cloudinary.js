const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const uploadToCloudinary = async (filePath, folder = 'resumes') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      // Fallback: return relative local path if Cloudinary is unconfigured
      const relativePath = filePath.replace(/\\/g, '/').split('/server')[1] || `/uploads/${filePath.split(/[/\\]/).pop()}`;
      return { url: relativePath, publicId: null };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ai_job_portal/${folder}`,
      resource_type: 'auto',
    });

    // Remove local file after successful Cloudinary upload
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.error('[File Clean Warning]:', e.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err) {
    console.error('[Cloudinary Upload Error]:', err.message);
    const filename = filePath.split(/[/\\]/).pop();
    return { url: `/uploads/${filename}`, publicId: null };
  }
};

module.exports = { cloudinary, uploadToCloudinary };
