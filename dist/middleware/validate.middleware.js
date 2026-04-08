"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const details = err.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            (0, apiResponse_1.sendError)(res, "Validation failed", 422, details);
            return;
        }
        next(err);
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map