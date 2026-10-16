import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, SESSION_MAX_AGE, getAuthSecret } from "./constants";

export type UserRole = "super" | "pengurus";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  mosqueId: number | null;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
    mosqueId: user.mosqueId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub) return null;
    return {
      id: Number(payload.sub),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role === "super" ? "super" : "pengurus",
      mosqueId: payload.mosqueId == null ? null : Number(payload.mosqueId),
    };
  } catch {
    return null;
  }
});

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

// Pengurus masjid — wajib punya masjid
export async function requireMosqueSession(): Promise<SessionUser & { mosqueId: number }> {
  const session = await requireSession();
  if (session.mosqueId == null) redirect("/superadmin");
  return session as SessionUser & { mosqueId: number };
}

export async function requireSuper(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "super") redirect("/admin");
  return session;
}
