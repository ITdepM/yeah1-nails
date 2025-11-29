import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { customerId, filter } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const now = new Date();

    let whereClause: any = { customerId };

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      whereClause.checkInAt = { gte: start, lte: end };
    }

    if (filter === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      whereClause.checkInAt = { gte: start };
    }

    if (filter === "month") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      whereClause.checkInAt = { gte: start };
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      orderBy: { checkInAt: "desc" },
    });

    return NextResponse.json({ visits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
