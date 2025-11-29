import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { inviteCode: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // delete visits
    await prisma.visit.deleteMany({
      where: { customerId },
    });

    // delete invite code
    if (customer.inviteCode) {
      await prisma.inviteCode.delete({
        where: { customerId },
      });
    }

    // delete customer
    await prisma.customer.delete({
      where: { id: customerId },
    });

    // log delete
    await prisma.adminLog.create({
      data: {
        action: "DELETE",
        details: `Deleted customer ${
          customer.fullName || customer.phone
        } and all visit records`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

