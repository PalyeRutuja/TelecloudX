import { listZones } from "@/lib/cloudstack";

export async function GET() {
  try {
    const result = await listZones();
    
    console.log("=== Testing CloudStack Connection ===");
    
    return Response.json({
      success: true,
      message: "Using mock CloudStack data",
      data: result,
    });
  } catch (error: any) {
    console.error("CloudStack test failed:", error);
    return Response.json(
      { error: error.message || "CloudStack test failed" },
      { status: 500 }
    );
  }
}
