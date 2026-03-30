import nodemailer from "nodemailer";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function reservationSummary(r, businessName) {
  return {
    businessName: String(businessName || r.business_slug || "Iraniu"),
    date: String(r.reservation_date || "").trim(),
    time: String(r.reservation_time || "").trim(),
    party: Number(r.party_size) || 2,
    name: String(r.customer_name || "").trim(),
    email: String(r.customer_email || "").trim(),
    phone: String(r.customer_phone || "").trim(),
    notes: String(r.notes || "").trim(),
  };
}

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendReservationEmails({
  reservation,
  businessName,
  managerEmail,
  managerName,
  businessSlug,
}) {
  const tx = getTransporter();
  if (!tx) return { skipped: true, reason: "smtp_not_configured" };
  const from = process.env.EMAIL_FROM?.trim() || "Iraniu <no-reply@iraniu.uk>";
  const s = reservationSummary(reservation, businessName);
  const dashboardUrl = `${(process.env.PUBLIC_SITE_URL || process.env.SITE_BASE_URL || "").replace(/\/$/, "")}/dashboard/reservations`;
  const businessUrl = `${(process.env.PUBLIC_SITE_URL || process.env.SITE_BASE_URL || "").replace(/\/$/, "")}/business?slug=${encodeURIComponent(
    businessSlug
  )}`;

  const managerHtml = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.7;color:#1a1f24">
      <h2 style="margin:0 0 12px">New Reservation Request</h2>
      <p>Hello ${escapeHtml(managerName || "Manager")},</p>
      <p>You have received a new reservation request for <strong>${escapeHtml(s.businessName)}</strong>.</p>
      <table style="border-collapse:collapse;margin:12px 0">
        <tr><td style="padding:6px 12px 6px 0"><strong>Date</strong></td><td>${escapeHtml(s.date)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Time</strong></td><td>${escapeHtml(s.time)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Guests</strong></td><td>${escapeHtml(String(s.party))}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Customer</strong></td><td>${escapeHtml(s.name)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Email</strong></td><td>${escapeHtml(s.email)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Phone</strong></td><td>${escapeHtml(s.phone || "—")}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Notes</strong></td><td>${escapeHtml(s.notes || "—")}</td></tr>
      </table>
      <p><a href="${escapeHtml(dashboardUrl)}">Open your reservation calendar</a></p>
      <p style="color:#5c6670">Sent by Iraniu booking system.</p>
    </div>
  `;

  const customerHtml = `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.7;color:#1a1f24">
      <h2 style="margin:0 0 12px">Thank you for your booking</h2>
      <p>Dear ${escapeHtml(s.name)},</p>
      <p>Your booking request for <strong>${escapeHtml(s.businessName)}</strong> has been received.</p>
      <table style="border-collapse:collapse;margin:12px 0">
        <tr><td style="padding:6px 12px 6px 0"><strong>Date</strong></td><td>${escapeHtml(s.date)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Time</strong></td><td>${escapeHtml(s.time)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0"><strong>Guests</strong></td><td>${escapeHtml(String(s.party))}</td></tr>
      </table>
      <p>We will contact you shortly to confirm.</p>
      <p><a href="${escapeHtml(businessUrl)}">View business profile</a></p>
      <p style="color:#5c6670">Thank you, Iraniu</p>
    </div>
  `;

  await Promise.allSettled([
    managerEmail
      ? tx.sendMail({
          from,
          to: managerEmail,
          subject: `New reservation - ${s.businessName} (${s.date} ${s.time})`,
          html: managerHtml,
          text: `New reservation for ${s.businessName}\nDate: ${s.date}\nTime: ${s.time}\nGuests: ${s.party}\nCustomer: ${s.name}\nEmail: ${s.email}\nPhone: ${s.phone || "-"}`,
        })
      : Promise.resolve(),
    s.email
      ? tx.sendMail({
          from,
          to: s.email,
          subject: `Your booking request - ${s.businessName}`,
          html: customerHtml,
          text: `Thank you for your booking request.\nBusiness: ${s.businessName}\nDate: ${s.date}\nTime: ${s.time}\nGuests: ${s.party}`,
        })
      : Promise.resolve(),
  ]);
  return { ok: true };
}

export async function sendManagerTelegramBooking({
  botToken,
  chatId,
  reservation,
  businessName,
}) {
  const token = String(botToken || "").trim();
  const chat = String(chatId || "").trim();
  if (!token || !chat) return { skipped: true, reason: "manager_telegram_not_configured" };
  const s = reservationSummary(reservation, businessName);
  const text = [
    "📅 رزرو جدید",
    `🏪 ${s.businessName}`,
    `👤 ${s.name}`,
    `📅 ${s.date} ⏰ ${s.time}`,
    `👥 تعداد نفرات: ${s.party}`,
    `📧 ${s.email}`,
    s.phone ? `📞 ${s.phone}` : "",
    s.notes ? `📝 ${s.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: /^-?\d+$/.test(chat) ? Number(chat) : chat,
      text,
      disable_web_page_preview: true,
    }),
  });
  const raw = await r.text();
  let j = {};
  try {
    j = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (!r.ok || !j.ok) return { ok: false, error: j.description || raw || String(r.status) };
  return { ok: true };
}
