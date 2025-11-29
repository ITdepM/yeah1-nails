import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || ""; // search keyword

    const customers = await prisma.customer.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    // ALWAYS return an array:
    return NextResponse.json({ customers });
  } catch (err: any) {
    console.error("CUSTOMERS API ERROR:", err);
    return NextResponse.json({ customers: [], error: err.message }, { status: 200 });
  }
}

