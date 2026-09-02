import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const existing = await db.select({ id: users.id }).from(users).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: "Already initialized" });
    }

    const hashed = await hashPassword("AGENT008");
    await db.insert(users).values({
      username: "admin",
      password: hashed,
      role: "admin",
      balance: "0",
      status: "active",
    });

    return NextResponse.json({ message: "Admin created", username: "admin", password: "AGENT008" });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
