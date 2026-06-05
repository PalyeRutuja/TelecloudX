import { verifyFirebaseIdToken } from "./auth";

export async function requireAuth(request: Request): Promise<{
  userId: string;
  email: string;
  name: string;
} | Response> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyFirebaseIdToken(token);

  if (!payload) {
    return Response.json(
      { error: "Unauthorized - Invalid or expired Firebase token" },
      { status: 401 }
    );
  }

  return payload;
}
