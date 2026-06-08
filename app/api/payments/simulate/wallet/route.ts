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
      wallet = "phonepe", 
      amount = 2499, 
      simulateSuccess = true,
      delay = 0 
    } = body;

    const orderId = `order_sim_${Date.now()}`;
    const paymentId = generatePaymentId();
    
    const payment: SimulatedPayment = {
      orderId,
      paymentId,
      method: wallet,
      amount,
      status: "created",
      createdAt: new Date(),
      metadata: { wallet },
    };

    paymentStore.set(paymentId, payment);

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (simulateSuccess) {
      payment.status = "captured";
      
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
              method: "wallet",
              wallet,
              created_at: Math.floor(Date.now() / 1000),
            }
          }
        }
      };

      console.log(`${wallet} Webhook simulated:`, webhookPayload);

      return Response.json({
        success: true,
        message: `${wallet} payment simulated successfully`,
        payment: {
          id: paymentId,
          orderId,
          amount,
          status: "captured",
          method: "wallet",
          wallet,
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
              method: "wallet",
              wallet,
              error_description: "Wallet payment failed",
            }
          }
        }
      };

      console.log(`${wallet} Failed Webhook simulated:`, webhookPayload);

      return Response.json({
        success: false,
        message: `${wallet} payment simulation failed`,
        payment: {
          id: paymentId,
          orderId,
          amount,
          status: "failed",
          method: "wallet",
          wallet,
          error: "Wallet payment failed",
        }
      });
    }
  } catch (error: any) {
    console.error("Wallet simulation failed:", error);
    return Response.json(
      { error: error.message || "Wallet simulation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const payments = Array.from(paymentStore.values());
  return Response.json({ payments });
}
