import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper to generate referral codes like Y1N-4831
function generateInviteCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Y1N-${num}`;
}

export async function POST(req: Request) {
  try {
    const { fullName, phone, email, birthday, inviteCode } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const settings = await prisma.appSettings.findFirst();

    const birthdayDate = birthday ? new Date(birthday) : null;

    // ---------- FIND customer ----------
    let customer = await prisma.customer.findUnique({
      where: { phone },
      include: { inviteCode: true, invitedBy: true },
    });

    let isNewCustomer = false;

    // ---------- CREATE new customer ----------
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: fullName || "",
          phone,
          email,
          birthday: birthdayDate,
          totalPoints: 0,
        },
        include: { inviteCode: true, invitedBy: true },
      });

      isNewCustomer = true;

      // LOG: New Signup
      await prisma.adminLog.create({
        data: {
          action: "SIGNUP",
          details: `New customer signed up: ${customer.fullName} (${customer.phone})`,
        },
      });
    } else {
      // Update missing fields
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fullName: fullName || customer.fullName,
          email: email || customer.email,
          birthday: birthdayDate || customer.birthday,
        },
      });

      customer = await prisma.customer.findUnique({
        where: { phone },
        include: { inviteCode: true, invitedBy: true },
      });
    }

    // ---------- SIGNUP BONUS ----------
    let signupBonusApplied = false;

    if (isNewCustomer && settings?.signupBonus) {
      await prisma.customer.update({
        where: { id: customer!.id },
        data: { totalPoints: { increment: settings.signupBonus } },
      });

      signupBonusApplied = true;
    }

    // ---------- REFERRAL BONUS ----------
    let inviterBonusApplied = false;

    if (inviteCode && inviteCode.trim() !== "") {
      const inviter = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
        include: { customer: true },
      });

      if (inviter && inviter.customerId !== customer!.id) {
        if (inviter.uses < (settings?.maxReferralUses ?? 3)) {
          // Give inviter bonus
          await prisma.customer.update({
            where: { id: inviter.customerId },
            data: { totalPoints: { increment: settings?.referralBonus ?? 20 } },
          });

          inviterBonusApplied = true;

          // Update usage
          await prisma.inviteCode.update({
            where: { code: inviteCode },
            data: { uses: { increment: 1 } },
          });

          // Save invited-by relationship
          await prisma.customer.update({
            where: { id: customer!.id },
            data: { invitedById: inviter.customerId },
          });

          // LOG: Referral
          await prisma.adminLog.create({
            data: {
              action: "REFERRAL",
              details: `${inviter.customer.fullName} earned +${settings?.referralBonus ?? 20} from inviting ${customer!.fullName}`,
            },
          });
        }
      }
    }

    // ---------- CREATE INVITE CODE IF CUSTOMER DOES NOT HAVE ----------
    if (!customer!.inviteCode) {
      const code = generateInviteCode();

      await prisma.inviteCode.create({
        data: {
          code,
          customerId: customer!.id,
        },
      });

      // LOG: invite code created
      await prisma.adminLog.create({
        data: {
          action: "INVITECODE",
          details: `Generated invite code ${code} for ${customer!.fullName}`,
        },
      });
    }

    const finalCustomer = await prisma.customer.findUnique({
      where: { phone },
      include: { inviteCode: true },
    });

    return NextResponse.json({
      success: true,
      customer: finalCustomer,
      signupBonusApplied,
      inviterBonusApplied,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
