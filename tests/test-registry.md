# Backend Test Registry

| File | Type | Feature / Endpoints Tested | Status |
|---|---|---|---|
| `tests/unit/auth.test.ts` | Unit | Auth / POST `/api/v1/auth/register`, `/api/v1/auth/login`, etc. | 🟢 Passing |
| `tests/unit/chat.test.ts` | Unit | Chat / Socket messaging logic | 🟢 Passing |
| `tests/unit/google-auth.test.ts` | Unit | Auth / Google OAuth callback logic | 🟢 Passing |
| `tests/unit/match.test.ts` | Unit | Match / GET `/api/v1/match/profiles`, POST `.../swipe`, POST `.../reset-rejected`, POST `.../reset-all` | 🟢 Passing |
| `tests/unit/team.test.ts` | Unit | Teams / Standard team CRUD | 🟢 Passing |
| `tests/unit/upload.test.ts` | Unit | Upload / Cloudinary integration | 🟢 Passing |
| `tests/unit/user.test.ts` | Unit | Users / Profile updates | 🟢 Passing |
| `tests/post.integration.test.ts` | Integration | Posts / Feed end-to-end flows | 🟢 Passing |