# Backend Test Registry

| Feature | Test File Path | Type | Routes Covered | Status |
|---------|---------------|------|----------------|--------|
| **Auth** | [auth.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/auth.test.ts) | Unit | `POST /register`, `POST /login`, `POST /logout`, `GET /me` | ✅ Passing |
| **Match** | [match.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/match.test.ts) | Unit | `GET /profiles`, `POST /like`, `GET /matches` | ✅ Passing |
| **Teams** | [team.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/team.test.ts) | Unit | `POST /`, `GET /:id`, `POST /:id/invite`, `DELETE /:id`, `DELETE /:id/members/me`, `PATCH /:id` | ✅ Passing |
| **Users** | [user.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/user.test.ts) | Unit | `GET /:username`, `PATCH /me`, `GET /search`, `GET /:username/posts` | ✅ Passing |
| **Chat** | [chat.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/chat.test.ts) | Unit | `GET /`, `POST /`, `POST /:id/join`, `DELETE /:id/members/me` | ✅ Passing |
| **Upload** | [upload.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/upload.test.ts) | Unit | `POST /avatar` | ✅ Passing |
| **Google Auth** | [google-auth.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/unit/google-auth.test.ts) | Unit | `GET /auth/google/callback` | ✅ Passing |
| **Posts** | [post.integration.test.ts](file:///home/mallhar/.gemini/antigravity/playground/hidden-perseverance/backend/tests/post.integration.test.ts) | Integration | `POST /`, `GET /`, `POST /:postId/comments` | ✅ Passing |
