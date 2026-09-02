import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { eq } from "@/db/query";
import { db } from "@/db";
import { users } from "@/db/schema";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is required in production");
}

const secret = new TextEncoder().encode(jwtSecret || "dev-only-secret");
const COOKIE_NAME = "panel_session";

export interface SessionUser {
  id: number;
  username: string;
  role: "admin" | "client";
  balance: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

async function fetchUserById(userId: number): Promise<SessionUser | null> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      balance: users.balance,
    })
    .from(users)
    .where(eq(users.id, userId));
  return (rows[0] as SessionUser) ?? null;
}

export async function refreshSessionUser(userId: number): Promise<SessionUser> {
  const user = await fetchUserById(userId);
  if (!user) throw new Error("User not found");
  await createSession(user);
  return user;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  // Read fresh data without rewriting the session cookie, so this is safe to
  // call during Server Component render (cookies can only be modified in a
  // Server Action or Route Handler).
  try {
    return await fetchUserById(sessionUser.id);
  } catch {
    return null;
  }
}
