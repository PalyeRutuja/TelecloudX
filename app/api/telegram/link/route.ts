export const dynamic = "force-dynamic";
import { verifyJWT } from "@/lib/jwt-auth";

const telegramLinks = new Map<string, string>();

export function getTelegramLinkToken(telegramId: string): string | undefined {
  return telegramLinks.get(telegramId);
}

export function setTelegramLinkToken(telegramId: string, token: string): void {
  telegramLinks.set(telegramId, token);
}

export async function POST(request: Request) {
  try {
    const { token, telegramId } = await request.json();

    if (!token || !telegramId) {
      return Response.json(
        { error: "Token and telegramId are required" },
        { status: 400 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    setTelegramLinkToken(String(telegramId), token);

    return Response.json({
      success: true,
      message: "Telegram account linked successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Link failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
