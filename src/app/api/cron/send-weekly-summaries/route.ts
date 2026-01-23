import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message:
      "Weekly summary feature is temporarily disabled due to library incompatibility.",
  });
}
