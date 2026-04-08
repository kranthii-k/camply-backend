"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cloudinary_1 = require("../config/cloudinary");
const apiResponse_1 = require("../utils/apiResponse");
const router = (0, express_1.Router)();
// POST /api/v1/upload/avatar — standalone Cloudinary upload
router.post("/avatar", auth_middleware_1.authenticate, cloudinary_1.avatarUpload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        if (!file?.buffer) {
            (0, apiResponse_1.sendError)(res, "Upload failed: No file provided", 400);
            return;
        }
        const url = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, "camply/avatars");
        (0, apiResponse_1.sendSuccess)(res, { url }, "Upload successful", 201);
    }
    catch {
        (0, apiResponse_1.sendError)(res, "Upload failed to process", 500);
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map