-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "signupBonus" INTEGER NOT NULL DEFAULT 20,
    "checkoutBonus" INTEGER NOT NULL DEFAULT 15,
    "referralBonus" INTEGER NOT NULL DEFAULT 20,
    "referralInvitee" INTEGER NOT NULL DEFAULT 20,
    "redeemCost" INTEGER NOT NULL DEFAULT 150,
    "maxReferralUses" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
