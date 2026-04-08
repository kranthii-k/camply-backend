import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
export declare const avatarUpload: multer.Multer;
export declare const uploadToCloudinary: (buffer: Buffer, folder: string) => Promise<string>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map