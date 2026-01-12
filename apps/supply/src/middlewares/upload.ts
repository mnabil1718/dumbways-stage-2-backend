import multer from "multer";
import path from "path";
import crypto from "node:crypto";
import { InvariantError } from "@repo/shared";

// allowed file types
const IMAGE_MIME_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
];

const storage = multer.diskStorage({
        destination: "src/public/uploads",
        filename: function (req, file, callback) {
                const name_split = file.originalname.split(".");
                const ext = path.extname(file.originalname); // .png, .jpg, etc
                const base = path.basename(file.originalname, ext);
                const id = crypto.randomBytes(6).toString("base64url");
                const filename = `${id}-${base}${ext}`;
                callback(null, filename);
        },
});

const fileFilterCallback = (req: any, file: any, callback: any) => {
        if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
                return callback(new InvariantError("invalid image type"), false);
        }

        return callback(null, true);
};

const uploadOpts = {
        storage,
        limits: { fileSize: 3 * 1024 * 1024 },
        fileFilter: fileFilterCallback,
};

const upload = multer(uploadOpts);
export const singleImageUploadMiddleware = upload.single("image");
