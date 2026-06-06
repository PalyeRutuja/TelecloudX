JWT + Firebase Auth (server-side)

This project provides JWT-style authentication backed by Firestore.

Required environment variables (add to `.env`):

- `JWT_SECRET` - a long random secret used to sign tokens (required in production)
- `JWT_EXPIRES_IN` - optional (default `24h`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
 - `FIREBASE_SERVICE_ACCOUNT` - JSON string of the Firebase service account (required for server-side API routes)

How it works:
- `app/api/auth/register/route.ts` — registers a user (password hashed) and returns a JWT.
- `app/api/auth/login/route.ts` — verifies credentials and returns a JWT.
- `lib/jwt-auth.ts` — Firestore-backed user store, password hashing, JWT generation/verification.
- `lib/firebase.ts` — initializes Firebase client SDK using the `NEXT_PUBLIC_*` env vars.
 - `lib/firebase.ts` — initializes Firebase client SDK using the `NEXT_PUBLIC_*` env vars.
 - `lib/firebase-admin.ts` — server-side Firebase Admin initializer used by API routes (requires `FIREBASE_SERVICE_ACCOUNT`).

Notes:
- The Firestore `users` collection stores records with fields: `id`, `email`, `name`, `passwordHash`, `createdAt`.
- For production, protect Firestore rules and consider using a Firebase Admin service account for server-side operations.
 - For server-side API routes we use the Firebase Admin SDK to bypass Firestore security rules (requires `FIREBASE_SERVICE_ACCOUNT`).
- The Telegram bot should call `POST /api/auth/login` to obtain a JWT (same endpoint used by the website).

Next steps you may want me to do:
- Add endpoint tests or a small Postman collection.
- Add Firebase Admin integration (service account) for server-side elevated access.
 - (Done) Firebase Admin integration added. You must install the dependency and add `FIREBASE_SERVICE_ACCOUNT`.

Install and run:

```bash
cd my-next-app
npm install
# set FIREBASE_SERVICE_ACCOUNT in your environment (export or .env) as the JSON string
npm run dev
```
- Wire HttpOnly cookies for browser auth instead of localStorage.
