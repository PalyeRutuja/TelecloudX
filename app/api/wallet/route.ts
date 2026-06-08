import { requireAuth } from "@/lib/middleware";
import { getBalance, getUserTransactions } from "@/lib/wallet";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const balance = getBalance(auth.userId);
    const transactions = getUserTransactions(auth.userId);

    return Response.json({
      success: true,
      balance,
      transactions,
    });
  } catch (error: any) {
    console.error("Failed to get wallet:", error);
    return Response.json(
      { error: error.message || "Failed to get wallet" },
      { status: 500 }
    );
  }
}
