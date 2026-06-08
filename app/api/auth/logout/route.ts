export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return Response.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
