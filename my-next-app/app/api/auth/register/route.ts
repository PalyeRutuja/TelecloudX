export async function POST() {
  return Response.json(
    {
      error:
        "Firebase Auth is now handled on the client. Register through the signup page instead of this endpoint.",
    },
    { status: 410 }
  );
}
