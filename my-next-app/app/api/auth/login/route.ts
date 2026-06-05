export async function POST() {
  return Response.json(
    {
      error:
        "Firebase Auth is now handled on the client. Sign in through the login page instead of this endpoint.",
    },
    { status: 410 }
  );
}
