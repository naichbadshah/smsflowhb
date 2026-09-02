import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions, activations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const [userStats] = await db
      .select({ count: sql<number>`count(*)`, totalBalance: sql<string>`coalesce(sum(${users.balance}), '0')` })
      .from(users);

    const [transactionStats] = await db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), '0')` })
      .from(transactions)
      .where(sql`${transactions.status} = 'completed'`);

    const [activationStats] = await db
      .select({
        count: sql<number>`count(*)`,
        pending: sql<number>`sum(case when ${activations.status} = 'pending' then 1 else 0 end)`,
        completed: sql<number>`sum(case when ${activations.status} = 'completed' then 1 else 0 end)`,
        cancelled: sql<number>`sum(case when ${activations.status} = 'cancelled' then 1 else 0 end)`,
      })
      .from(activations);

    return NextResponse.json({
      users: userStats,
      transactions: transactionStats,
      activations: activationStats,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
