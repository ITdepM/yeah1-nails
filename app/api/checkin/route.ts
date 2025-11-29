import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullName, phone, service, heard } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // 1️⃣ Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone,
          fullName: fullName || "",
        },
      });
    }

    // 2️⃣ Check for open visit
    const existingVisit = await prisma.visit.findFirst({
      where: { customerId: customer.id, checkOutAt: null },
    });

    if (existingVisit) {
      return NextResponse.json({
        success: false,
        error: "You already checked in! Please check out first.",
      });
    }

    // 3️⃣ Create new visit
    const visit = await prisma.visit.create({
      data: {
        customerId: customer.id,
        checkInAt: new Date(),
        service,
        heard,
      },
    });

    // 4️⃣ Log admin action (AFTER variables exist)
    await prisma.adminLog.create({
      data: {
        action: "CHECKIN",
        details: `${customer.fullName || ""} (${phone}) checked in`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Welcome ${customer.fullName || ""}!`,
      visitId: visit.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
