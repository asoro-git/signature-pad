// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const { basePath, pathname } = req.nextUrl;
  if (
    host === "effulgent-lolly-8462e0.netlify.app" &&
    basePath === "" && // only when not under /signpad
    pathname === "/"
  ) {
    return NextResponse.redirect("https://sydneyot.com/signpad");
  }
  return NextResponse.next();
}
