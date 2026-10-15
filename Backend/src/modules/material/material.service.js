import { Material } from './material.model.js';
import { getImageKitInstance } from '../../shared/config/imagekit.js';
import { logger } from '../../shared/utils/logger.js';

export const uploadMaterial = async ({
  userId,
  title,
  subject,
  description = '',
  tags = [],
  fileBuffer,
  originalName,
  fileSize,
}) => {
  const imagekit = getImageKitInstance();

  // Sanitize filename
  const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = cleanName.toLowerCase().endsWith('.pdf') ? cleanName : `${cleanName}.pdf`;

  // Upload to ImageKit
  let uploadResult;
  try {
    uploadResult = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder: `/prepzone/materials/${userId}`,
      tags: ['prepzone', 'pdf', subject, ...tags],
      useUniqueFileName: true,
    });
  } catch (err) {
    logger.error('ImageKit upload failed:', err);
    const error = new Error(err.message || 'Failed to upload document to storage provider');
    error.statusCode = 502;
    throw error;
  }

  // Create material document in MongoDB with orphan cleanup compensation
  let material;
  try {
    material = await Material.create({
      user: userId,
      title: title.trim(),
      subject,
      description: (description || '').trim(),
      tags,
      fileUrl: uploadResult.url,
      fileId: uploadResult.fileId,
      fileName: originalName,
      fileSize: uploadResult.size || fileSize,
      thumbnailUrl: uploadResult.thumbnailUrl || '',
    });
  } catch (dbError) {
    // If DB insert fails, rollback uploaded file from ImageKit to avoid orphaned cloud files
    logger.error('Database insertion failed. Rolling back ImageKit upload:', dbError);
    try {
      await imagekit.deleteFile(uploadResult.fileId);
    } catch (cleanupError) {
      logger.error('Failed to cleanup orphan ImageKit file during rollback:', cleanupError);
    }
    throw dbError;
  }

  return material;
};

export const getUserMaterials = async (userId, { search = '', subject = 'All', page = 1, limit = 50 } = {}) => {
  const query = { user: userId };

  if (subject && subject !== 'All') {
    query.subject = subject;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const [materials, totalCount, stats] = await Promise.all([
    Material.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Material.countDocuments(query),
    Material.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalStorage: { $sum: '$fileSize' },
          totalFiles: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalStorage = stats.length > 0 ? stats[0].totalStorage : 0;
  const userTotalFiles = stats.length > 0 ? stats[0].totalFiles : 0;

  return {
    materials,
    pagination: {
      total: totalCount,
      page: parseInt(page, 10),
      limit: parsedLimit,
      pages: Math.ceil(totalCount / parsedLimit) || 1,
    },
    stats: {
      totalStorage,
      totalFiles: userTotalFiles,
    },
  };
};

export const getMaterialById = async (userId, materialId) => {
  const material = await Material.findOne({ _id: materialId, user: userId }).lean();
  if (!material) {
    const error = new Error('Material not found or access denied');
    error.statusCode = 404;
    throw error;
  }
  return material;
};

export const deleteMaterial = async (userId, materialId) => {
  const material = await Material.findOne({ _id: materialId, user: userId });
  if (!material) {
    const error = new Error('Material not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  // Delete from ImageKit
  try {
    const imagekit = getImageKitInstance();
    await imagekit.deleteFile(material.fileId);
  } catch (err) {
    logger.warn(`Could not delete file ${material.fileId} from ImageKit:`, err.message);
    // Proceed with database deletion even if remote file was already removed
  }

  await material.deleteOne();
  return { id: materialId };
};
