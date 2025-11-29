import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ------------------ GET SETTINGS ------------------
export async function GET() {
  try {
    // AppSettings always has id = 1
    let settings = await prisma.appSettings.findUnique({
      where: { id: 1 },
    });

    // If missing, create default row
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {},
      });
    }

    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// ------------------ UPDATE SETTINGS ------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const updated = await prisma.appSettings.update({
      where: { id: 1 },
      data: {
        signupBonus: body.signupBonus,
        checkoutBonus: body.checkoutBonus,
        referralBonus: body.referralBonus,
        redeemCost: body.redeemCost,
        maxReferralUses: body.maxReferralUses,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

