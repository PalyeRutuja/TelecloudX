export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: Request) {
  try {
    const payload = await requireAuth(request);
    if (payload instanceof Response) return payload;

    return Response.json({
      success: true,
      user: payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
