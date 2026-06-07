import Razorpay from "razorpay";
import Stripe from "stripe";

// Initialize payment clients
export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    })
  : null;

// PayPal configuration
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || "",
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  environment: process.env.NODE_ENV === "production" ? "live" : "sandbox",
};

// Payment providers configuration
export const paymentProviders = [
  {
    id: "upi",
    name: "UPI",
    description: "Pay via UPI QR code or intent",
    icon: "QrCode",
    color: "bg-blue-600",
    active: true,
    featured: true,
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Cards, UPI, Netbanking via Razorpay",
    icon: "CreditCard",
    color: "bg-purple-600",
    active: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "International cards & wallets",
    icon: "Globe",
    color: "bg-indigo-600",
    active: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with PayPal balance or card",
    icon: "Wallet",
    color: "bg-blue-700",
    active: true,
  },
  {
    id: "crypto",
    name: "Crypto",
    description: "Pay with cryptocurrency",
    icon: "Bitcoin",
    color: "bg-orange-600",
    active: true,
  },
];
