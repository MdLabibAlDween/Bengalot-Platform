import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { ensureInvoiceForOrder, generateMissingInvoices } from "@/lib/invoices";
import { sendInvoiceEmail } from "@/lib/email";
import type { InvoiceRow } from "@/lib/invoices";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate_missing") }),
  z.object({ action: z.literal("generate"), orderNo: z.string().trim().min(3).max(60) }),
]);

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid invoice action.");

  if (parsed.data.action === "generate_missing") {
    const result = await generateMissingInvoices(auth.admin);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "invoices_backfilled",
      entity: "invoices",
      after: result,
    });
    revalidatePath("/admin/invoices");
    return NextResponse.json({ ok: true, ...result });
  }

  const invoice = await ensureInvoiceForOrder(auth.admin, parsed.data.orderNo);
  if (!invoice) return badRequest("Could not generate an invoice for that order.");
  revalidatePath("/admin/invoices");
  return NextResponse.json({ ok: true, invoice });
}

export async function PUT(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const parsed = z
    .object({ invoiceNo: z.string().trim().min(3).max(80) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid invoice.");
  const { data } = await auth.admin
    .from("invoices")
    .select("*")
    .eq("invoice_no", parsed.data.invoiceNo)
    .maybeSingle();
  if (!data) return badRequest("Invoice not found.");
  const result = await sendInvoiceEmail(auth.admin, data as InvoiceRow, { force: true });
  if (!result.ok) return badRequest(result.error);
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: "invoice_emailed",
    entity: "invoices",
    entityId: String(data.id),
    after: { invoiceNo: data.invoice_no },
  });
  return NextResponse.json({ ok: true });
}
