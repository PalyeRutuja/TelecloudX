export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { createTransaction, processSuccessfulPayment, processFailedPayment } from "@/lib/wallet";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { amount, currency = "USD", provider } = body;

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!provider) {
      return Response.json(
        { error: "Payment provider is required" },
        { status: 400 }
      );
    }

    // Create pending transaction
    const transaction = createTransaction({
      userId: auth.userId,
      amount,
      currency,
      provider,
      status: "PENDING",
      metadata: { initiatedAt: new Date().toISOString() },
    });

    return Response.json({
      success: true,
      transaction,
      message: "Transaction created. Complete payment to add credits.",
    });
  } catch (error: any) {
    console.error("Failed to create top-up:", error);
    return Response.json(
      { error: error.message || "Failed to create top-up" },
      { status: 500 }
    );
  }
}
