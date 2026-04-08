"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const pro_middleware_1 = require("../middleware/pro.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../models/schemas");
const eventController = __importStar(require("../controllers/hostedEvent.controller"));
const router = (0, express_1.Router)();
// Publicly view approved events
router.get("/", eventController.getEvents);
// Pro users can host events
router.post("/", auth_middleware_1.authenticate, pro_middleware_1.requiresPro, (0, validate_middleware_1.validate)(schemas_1.createHostedEventSchema), eventController.createEvent);
// Admin routes (would normally be in a separate admin.routes for better gating)
// For simplicity within the requested brief:
router.get("/admin", auth_middleware_1.authenticate, eventController.getAdminEvents);
router.patch("/admin/:id/status", auth_middleware_1.authenticate, eventController.approveEvent);
exports.default = router;
//# sourceMappingURL=hostedEvent.routes.js.map