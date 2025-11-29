import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // 1️⃣ Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Phone number not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Find open visit
    const visit = await prisma.visit.findFirst({
      where: { customerId: customer.id, checkOutAt: null },
      orderBy: { checkInAt: "desc" },
    });

    if (!visit) {
      return NextResponse.json({
        success: false,
        error: "No active check-in found.",
      });
    }

    // 3️⃣ Award +15 pts
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: { totalPoints: { increment: 15 } },
    });

    // 4️⃣ Update visit
    await prisma.visit.update({
      where: { id: visit.id },
      data: {
        checkOutAt: new Date(),
        pointsAwarded: 15,
      },
    });

    // 5️⃣ Log admin action
    await prisma.adminLog.create({
      data: {
        action: "CHECKOUT",
        details: `${customer.fullName || ""} (${phone}) checked out (+15 pts)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "🎉 +15 points awarded!",
      totalPoints: updatedCustomer.totalPoints,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
