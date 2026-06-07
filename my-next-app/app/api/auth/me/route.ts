import { verifyJWT } from "@/lib/jwt-auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);

    if (!payload) {
      return Response.json(
        { error: "Unauthorized - Invalid or expired token" },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user: payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    console.error("Auth check failed:", error);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
