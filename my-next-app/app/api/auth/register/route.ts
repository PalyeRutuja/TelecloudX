/**
 * POST /api/auth/register
 * -----------------------
 * Creates a new user account with name, email, and password.
 * Validates: password match, min 6 chars, email uniqueness.
 * Returns: { success, token, user } on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateJWT, createUser, findUserByEmail } from "@/lib/jwt-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required: name, email, password, confirmPassword" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(name, email, passwordHash);

    // Generate JWT token
    const token = await generateJWT(user);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/auth/register] Error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
