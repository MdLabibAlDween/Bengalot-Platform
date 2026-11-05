-- Atomic reward redemption. Locks the customer profile so concurrent requests
-- cannot spend the same points, creates a personal coupon and writes the ledger
-- entry in one transaction.

create or replace function public.bengalot_redeem_reward(reward_key text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  cfg jsonb;
  reward jsonb;
  balance integer;
  cost integer;
  code text;
  min_spend integer;
  reward_type text;
  reward_value integer;
  expiry date;
begin
  if uid is null then
    raise exception 'Sign in required.';
  end if;

  perform 1 from public.profiles where id = uid for update;

  select value into cfg from public.settings where key = 'rewards_config';
  if cfg is null or coalesce((cfg->>'enabled')::boolean, false) = false then
    raise exception 'Rewards are not active.';
  end if;

  select elem into reward
  from jsonb_array_elements(coalesce(cfg->'rewards', '[]'::jsonb)) elem
  where elem->>'key' = reward_key
  limit 1;

  if reward is null then
    raise exception 'That reward is not available.';
  end if;

  cost := coalesce((reward->>'points')::integer, 0);
  if cost <= 0 then
    raise exception 'That reward is not configured correctly.';
  end if;

  select coalesce(sum(points), 0) into balance
  from public.reward_ledger
  where profile_id = uid;

  if balance < cost then
    raise exception 'You need % more points for this reward.', cost - balance;
  end if;

  reward_type := coalesce(reward->>'type', 'fixed');
  if reward_type not in ('percent','fixed','shipping') then
    raise exception 'That reward type is not supported.';
  end if;
  reward_value := greatest(0, coalesce((reward->>'value')::integer, 0));
  min_spend := greatest(0, coalesce((reward->>'minSpend')::integer, 0));
  expiry := (now() + make_interval(days => greatest(7, coalesce((reward->>'expiresInDays')::integer, 90))))::date;
  code := 'BG-REWARD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.coupons
    (code, title, description, type, value, min_spend, expires_at, status, is_demo, profile_id, is_reward, reward_points)
  values
    (code, coalesce(reward->>'label', 'Bengalot reward'), reward->>'description', reward_type,
     case when reward_type = 'shipping' then 0 else reward_value end,
     min_spend, expiry, 'active', false, uid, true, cost);

  insert into public.reward_ledger (profile_id, kind, points, reference, note)
  values (uid, 'redemption', -cost, code, coalesce(reward->>'label', 'Reward redemption'));

  insert into public.customer_notifications (profile_id, kind, title, body, href, dedupe_key)
  values (
    uid,
    'reward',
    'Your reward code is ready',
    format('%s redeemed for %s points. Use code %s at checkout.', coalesce(reward->>'label', 'Reward'), cost, code),
    '/account/rewards',
    'reward:redeem:' || code
  );

  return code;
end;
$$;

revoke all on function public.bengalot_redeem_reward(text) from public, anon;
grant execute on function public.bengalot_redeem_reward(text) to authenticated;
