# TelecloudX

**Cloud Telephony & VM Deployment Platform**

A modern, full-stack Next.js application for deploying and managing cloud virtual machines through an intuitive web interface and WhatsApp bot integration. Built with Next.js 16.2.7, React 19, Tailwind CSS v4, and Firebase.

---

## Features

- **Landing Page** — Animated hero with particle sphere, stats ticker, service cards, and call-to-action
- **Authentication** — JWT-based auth with bcrypt password hashing and Firebase Firestore user storage
- **Dashboard** — Wallet balance, active VM count, transaction history, and account overview
- **VM Management** — Deploy VMs via CloudStack API with service offerings, templates, zones, and networks
- **Billing & Payments** — Add credits via Razorpay, Stripe, UPI QR codes, or crypto wallets (EVM via ethers.js)
- **Analytics** — Usage charts and visualizations with Recharts
- **WhatsApp Bot** — Planned Twilio integration for VM management via chat commands

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.7 (App Router + Turbopack) |
| Language | TypeScript 5 |
| UI | React 19.2.4, Tailwind CSS v4, Lucide React |
| Auth | JWT (jose), bcryptjs, Firebase Auth |
| Database | Firebase Firestore |
| VM Orchestration | CloudStack API |
| Payments | Razorpay, Stripe, UPI (QR), EVM Crypto |
| Charts | Recharts |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- CloudStack API credentials (for VM deployment)
- Payment gateway credentials (optional, for billing)

### Installation

```bash
# Clone the repository
git clone https://github.com/PalyeRutuja/TelecloudX.git
cd TelecloudX

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file with the following:

```bash
# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin (server-side)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# CloudStack
CLOUDSTACK_API_URL=https://your-cloudstack-api-endpoint
CLOUDSTACK_API_KEY=your-api-key
CLOUDSTACK_SECRET_KEY=your-secret-key

# Payments
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Project Structure

```
TelecloudX/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── sections/           # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── StatsTicker.tsx
│   │   ├── Intro.tsx
│   │   ├── Services.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── components/         # Reusable components
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── dashboard/          # Dashboard & sub-pages
│   ├── vms/                # VM list & deployment
│   └── api/                # API routes
│       ├── auth/           # Authentication
│       ├── wallet/         # Wallet & transactions
│       └── cloudstack/     # VM orchestration
├── lib/                    # Shared libraries
│   ├── jwt-auth.ts         # JWT utilities
│   ├── firebase.ts         # Firebase client
│   ├── firebase-admin.ts   # Firebase Admin
│   └── vm-store.ts         # VM Firestore CRUD
├── public/                 # Static assets
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Authenticate user | No |
| GET | `/api/auth/me` | Get current user | Bearer JWT |
| GET | `/api/wallet` | Get wallet balance | Bearer JWT |
| POST | `/api/wallet/transaction` | Add/deduct credits | Bearer JWT |
| GET | `/api/cloudstack/vms/deploy` | Get deployment options | Bearer JWT |
| POST | `/api/cloudstack/vms/deploy` | Deploy new VM | Bearer JWT |
| GET | `/api/cloudstack/vms/networks` | Get networks by zone | Bearer JWT |

---

## Authentication Flow

```
User → POST /api/auth/login (email + password)
     → Server verifies password with bcrypt
     → Server generates JWT (jose library)
     → Token stored in localStorage
     → Subsequent requests: Authorization: Bearer <token>
     → Server verifies JWT, fetches user from Firestore
```

---

## VM Deployment Flow

```
User → /vms/deploy
     → Page fetches offerings, templates, zones from CloudStack
     → User selects configuration, submits form
     → Server validates wallet balance (≥ $10)
     → Server calls CloudStack to deploy VM
     → $10 deducted from wallet (Firestore transaction)
     → VM record saved to Firestore with user ID
     → Success message with VM ID
```

---

## WhatsApp Bot Commands (Planned)

| Command | Action |
|---------|--------|
| `LOGIN` | Authenticate user |
| `LOGOUT` | End session |
| `DEPLOY` | Create new VM |
| `STATUS` | Check VM status |
| `START` | Start VM |
| `STOP` | Stop VM |
| `RESTART` | Restart VM |
| `DESTROY` | Delete VM |
| `BILLING` | View balance |
| `HELP` | Show commands |

---

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Self-Hosted

```bash
npm run build
npm start
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

## Support

For questions or support, please open an issue on [GitHub](https://github.com/PalyeRutuja/TelecloudX/issues).

---

**Built with ❤️ by the TelecloudX team.**
