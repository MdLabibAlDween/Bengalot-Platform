import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getRewardBalance,
  getRewardsConfig,
  tierFor,
} from "@/lib/account-db";
import { requireCustomerApi } from "@/lib/customer-api";

export async function GET() {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;

  const [config, ledger, coupons] = await Promise.all([
    getRewardsConfig(),
    ctx.admin
      .from("reward_ledger")
      .select("id,kind,points,reference,note,created_at")
      .eq("profile_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    ctx.admin
      .from("coupons")
      .select("code,title,description,type,value,min_spend,expires_at,status")
      .eq("profile_id", ctx.user.id)
      .eq("is_reward", true)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const rows = ledger.data ?? [];
  const points = rows.reduce((sum, row) => sum + Number(row.points ?? 0), 0);
  const { current, next } = tierFor(points, config.tiers);

  return NextResponse.json({
    config,
    points,
    tier: current,
    next,
    ledger: rows,
    rewards: config.rewards.map((reward) => ({
      ...reward,
      affordable: points >= reward.points,
    })),
    coupons: coupons.data ?? [],
  });
}

export async function POST(request: Request) {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const parsed = z
    .object({ rewardKey: z.string().trim().min(1).max(60) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a reward." }, { status: 400 });
  }

  const { data, error } = await ctx.supabase.rpc("bengalot_redeem_reward", {
    reward_key: parsed.data.rewardKey,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  const points = await getRewardBalance(ctx.admin, ctx.user.id);
  return NextResponse.json({ ok: true, code: data, points });
}
