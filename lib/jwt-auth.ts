import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { adminFirestore } from "@/lib/firebase-admin";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateJWT(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(user.id)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

const usersCollectionRef = () => adminFirestore.collection("users");

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const now = new Date().toISOString();
  const ref = usersCollectionRef().doc();
  const user: User = {
    id: ref.id,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: now,
  };
  await ref.set(user);
  return user;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const q = usersCollectionRef().where("email", "==", email.toLowerCase()).limit(1);
  const snap = await q.get();
  if (snap.empty) return undefined;
  const docSnap = snap.docs[0];
  return docSnap.data() as User;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const snap = await usersCollectionRef().doc(id).get();
  if (!snap.exists) return undefined;
  return snap.data() as User;
}

export async function requireAuth(request: Request): Promise<AuthUser | Response> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return Response.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return Response.json(
      { error: "Unauthorized - Invalid or expired token" },
      { status: 401 }
    );
  }

  return payload;
}
