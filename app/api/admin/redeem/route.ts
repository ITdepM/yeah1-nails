import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { totalPoints: { decrement: 150 } },
    });

    // Log redeem
    await prisma.adminLog.create({
      data: {
        action: "REDEEM",
        details: `Redeemed 150 points for ${
          customer.fullName || customer.phone
        }`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

