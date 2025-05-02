// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;
  if (host === "effulgent-lolly-8462e0.netlify.app" && pathname === "/") {
    return NextResponse.redirect(
      "https://effulgent-lolly-8462e0.netlify.app/signpad",
    );
  }
  return NextResponse.next();
}
