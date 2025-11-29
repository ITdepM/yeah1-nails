import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const filter = searchParams.get("filter"); // today | week | month
    const search = searchParams.get("search") || "";

    let dateFilter: any = {};

    // ----------- DATE FILTERS -----------
    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      dateFilter = { gte: start, lte: end };
    }

    if (filter === "week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter = { gte: start };
    }

    if (filter === "month") {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      dateFilter = { gte: start };
    }

    // ----------- FETCH VISITS -----------
    const visits = await prisma.visit.findMany({
      where: {
        checkInAt: dateFilter,
        customer: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        },
      },
      orderBy: { checkInAt: "desc" },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });

    return NextResponse.json({ visits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
