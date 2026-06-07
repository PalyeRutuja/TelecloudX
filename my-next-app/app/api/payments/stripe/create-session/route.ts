import { requireAuth } from "@/lib/middleware";
import { stripe } from "@/lib/payments";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { amount, currency = "USD", transactionId } = body;

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return Response.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "TelecloudX Credits",
              description: `Add $${amount} to your TelecloudX wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/topup?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/topup?canceled=true&transaction_id=${transactionId}`,
      metadata: {
        transactionId,
        userId: auth.userId,
      },
    });

    return Response.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe session creation failed:", error);
    return Response.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
