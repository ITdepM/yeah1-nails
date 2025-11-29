import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { checkInAt: "desc" },
    });

    return NextResponse.json({ visits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
