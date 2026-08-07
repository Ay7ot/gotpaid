import { jwtVerify, SignJWT } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

const ALGORITHM = "HS256";

export type AdminSessionPayload = { sub: string; role: "owner" | "staff" };

function secretKey() {
  if (!process.env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
}

export async function signAdminSession(payload: AdminSessionPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALGORITHM] });
    if (typeof payload.sub !== "string") return null;
    if (payload.role !== "owner" && payload.role !== "staff") return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
