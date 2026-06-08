import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("Razorpay webhook secret not configured");
      return Response.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return Response.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log("Razorpay webhook received:", event.event, event.payload);

    // Handle different event types
    switch (event.event) {
      case "payment.captured":
        // Payment successful - update order status in database
        console.log("Payment captured:", event.payload.payment.entity.id);
        break;
      case "payment.failed":
        // Payment failed
        console.log("Payment failed:", event.payload.payment.entity.id);
        break;
      case "order.paid":
        // Order fully paid
        console.log("Order paid:", event.payload.order.entity.id);
        break;
      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return Response.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
