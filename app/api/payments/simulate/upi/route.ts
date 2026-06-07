export const dynamic = "force-dynamic";
import crypto from "crypto";

interface SimulatedPayment {
  orderId: string;
  paymentId: string;
  method: string;
  amount: number;
  status: "created" | "captured" | "failed";
  createdAt: Date;
  metadata?: Record<string, any>;
}

// In-memory store for simulated payments (use DB in production)
const paymentStore = new Map<string, SimulatedPayment>();

function generatePaymentId(): string {
  return `pay_sim_${crypto.randomBytes(8).toString("hex")}`;
}

function generateSignature(orderId: string, paymentId: string): string {
  const secret = process.env.RAZORPAY_KEY_SECRET || "simulation_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      upiId, 
      amount = 2499, 
      simulateSuccess = true,
      delay = 0 
    } = body;

    const orderId = `order_sim_${Date.now()}`;
    const paymentId = generatePaymentId();
    
    const payment: SimulatedPayment = {
      orderId,
      paymentId,
      method: "upi",
      amount,
      status: "created",
      createdAt: new Date(),
      metadata: { upiId, provider: "google_pay" },
    };

    paymentStore.set(paymentId, payment);

    // Simulate async webhook delivery
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (simulateSuccess) {
      payment.status = "captured";
      
      // Trigger webhook simulation
      const webhookPayload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: amount * 100,
              currency: "INR",
              status: "captured",
              method: "upi",
              upi: { vpa: upiId || "test@upi" },
              created_at: Math.floor(Date.now() / 1000),
            }
          }
        }
      };

      // In production, this would POST to your actual webhook endpoint
      console.log("UPI Webhook simulated:", webhookPayload);

      return Response.json({
        success: true,
        message: "UPI payment simulated successfully",
        payment: {
          id: paymentId,
          orderId,
          amount,
          status: "captured",
          method: "upi",
          upiId: upiId || "test@upi",
          signature: generateSignature(orderId, paymentId),
        }
      });
    } else {
      payment.status = "failed";
      
      const webhookPayload = {
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              amount: amount * 100,
              currency: "INR",
              status: "failed",
              method: "upi",
              error_description: "Payment declined by user",
            }
          }
        }
      };

      console.log("UPI Failed Webhook simulated:", webhookPayload);

      return Response.json({
        success: false,
        message: "UPI payment simulation failed",
        payment: {
          id: paymentId,
          orderId,
          amount,
          status: "failed",
          method: "upi",
          error: "Payment declined by user",
        }
      });
    }
  } catch (error: any) {
    console.error("UPI simulation failed:", error);
    return Response.json(
      { error: error.message || "UPI simulation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const payments = Array.from(paymentStore.values());
  return Response.json({ payments });
}
