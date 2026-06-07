export const dynamic = "force-dynamic";
import { requireAuth } from "@/lib/middleware";
import { razorpay } from "@/lib/payments";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  if (!razorpay) {
    return Response.json(
      { error: "Razorpay not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: true,
    });

    return Response.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return Response.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
