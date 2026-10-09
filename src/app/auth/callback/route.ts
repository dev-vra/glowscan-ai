import { NextResponse, type NextRequest } from "next/server";
import { exchangeAuthCode } from "@/lib/data";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const ok = code ? await exchangeAuthCode(code) : false;
  return NextResponse.redirect(new URL(ok ? "/app" : "/entrar?erro=link", request.url));
}
