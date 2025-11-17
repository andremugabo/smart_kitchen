import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memoryStorage = multer.memoryStorage();

export function createImageUploadMiddleware(fieldName, folderName, options = {}) {
  const maxSizeMB = options.maxSizeMB ?? 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"));
      }
      cb(null, true);
    },
  }).single(fieldName);

  return [
    upload,
    async (req, res, next) => {
      try {
        if (!req.file) {
          return next();
        }

        const uploadsDir = path.join(__dirname, "..", "..", "uploads", folderName);
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const safeOriginal = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${timestamp}-${safeOriginal}`;
        const outputPath = path.join(uploadsDir, filename);

        const sharpInstance = sharp(req.file.buffer);

        const width = options.width ?? 1024;
        const height = options.height ?? null;

        await sharpInstance
          .resize(width, height, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: options.quality ?? 80 })
          .toFile(outputPath);

        req.savedImagePath = path.join("uploads", folderName, filename);
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}
