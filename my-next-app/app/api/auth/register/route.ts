import { createUser, findUserByEmail, hashPassword, generateJWT } from "@/lib/jwt-auth";
import { createWallet } from "@/lib/db/wallets";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await hashPassword(password);
    const user = await createUser(name, email, passwordHash);
    
    // Create wallet for new user
    try {
      await createWallet(user.id);
    } catch (walletError) {
      console.error("Failed to create wallet for new user:", walletError);
      // Don't fail registration if wallet creation fails
    }
    
    const token = await generateJWT(user);

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
