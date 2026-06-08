import { requireAuth } from "@/lib/middleware";
import { processDebit } from "@/lib/wallet";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { amount, type, description } = body;

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (type === "debit") {
      try {
        const { wallet, transaction } = await processDebit(
          auth.userId,
          amount,
          "internal",
          {
            type: "debit",
            description: description || "VM Deployment",
            timestamp: new Date().toISOString(),
          }
        );

        return Response.json({
          success: true,
          balance: wallet.balance,
          transaction,
          message: `Deducted $${amount} from wallet`,
        });
      } catch (err: any) {
        return Response.json(
          { error: err.message || "Insufficient balance" },
          { status: 400 }
        );
      }
    }

    return Response.json(
      { error: "Invalid transaction type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Failed to process wallet transaction:", error);
    return Response.json(
      { error: error.message || "Failed to process transaction" },
      { status: 500 }
    );
  }
}
