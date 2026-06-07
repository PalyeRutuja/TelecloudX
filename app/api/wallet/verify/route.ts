export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { processSuccessfulPayment, processFailedPayment, getTransaction } from "@/lib/wallet";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { transactionId, status, providerTransactionId, metadata } = body;

    if (!transactionId) {
      return Response.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const transaction = getTransaction(transactionId);
    if (!transaction) {
      return Response.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.userId !== auth.userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (status === "SUCCESS") {
      const result = await processSuccessfulPayment(
        transactionId,
        providerTransactionId,
        metadata
      );
      
      return Response.json({
        success: true,
        message: `Added $${result.transaction.amount} to your wallet`,
        balance: result.wallet.balance,
        transaction: result.transaction,
      });
    } else if (status === "FAILED") {
      const updated = await processFailedPayment(
        transactionId,
        metadata?.failureReason
      );
      
      return Response.json({
        success: true,
        message: "Payment failed. Credits not added.",
        transaction: updated,
      });
    } else {
      return Response.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Failed to verify payment:", error);
    return Response.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
