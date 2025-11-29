import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayCheckins, todayCheckouts, todaySignups] = await Promise.all([
      prisma.visit.count({
        where: { checkInAt: { gte: todayStart, lte: todayEnd } },
      }),

      prisma.visit.count({
        where: { checkOutAt: { gte: todayStart, lte: todayEnd } },
      }),

      prisma.customer.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
    ]);

    const [totalCustomers, totalVisits, logCount] = await Promise.all([
      prisma.customer.count(),
      prisma.visit.count(),
      prisma.adminLog.count(),
    ]);

    return NextResponse.json({
      todayCheckins,
      todayCheckouts,
      todaySignups,
      totalCustomers,
      totalVisits,
      logCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
