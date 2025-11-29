import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-auth", "true", {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return res;
}
