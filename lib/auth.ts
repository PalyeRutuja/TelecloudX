import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.projectId ||
  process.env.FIREBASE_PROJECT_ID;

if (!FIREBASE_PROJECT_ID) {
  throw new Error("Firebase project ID is not configured");
}

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export async function verifyFirebaseIdToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    return {
      userId: payload.sub as string,
      email: (payload.email as string) || "",
      name: (payload.name as string) || (payload.email as string) || "",
    };
  } catch {
    return null;
  }
}
