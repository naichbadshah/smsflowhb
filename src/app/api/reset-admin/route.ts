import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "@/db/query";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const hashed = await hashPassword("AGENT008");
    const updated = await db
      .update(users)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(users.username, "admin"))
      .returning({ id: users.id, username: users.username });

    if (!updated || updated.length === 0) {
      await db.insert(users).values({
        username: "admin",
        password: hashed,
        role: "admin",
        balance: "0",
        status: "active",
      });
      return NextResponse.json({ ok: true, action: "created", username: "admin" });
    }

    return NextResponse.json({ ok: true, action: "updated", username: "admin" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
