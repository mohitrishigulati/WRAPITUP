import { formatUsd } from "@/lib/catalog/money";
import type { FulfilledOrderEmail } from "@/lib/checkout/checkout";

export function orderConfirmationEmail(order: FulfilledOrderEmail) {
  const subject = `Order confirmed — ${order.orderNumber}`;
  const linesText = order.items
    .map(
      (item) =>
        `- ${item.name} × ${item.quantity} — ${formatUsd(item.lineTotal)}`,
    )
    .join("\n");

  const text = `Thanks for your order!

Order number: ${order.orderNumber}
Total: ${formatUsd(order.total)}

Items:
${linesText}

We'll email you when your order ships.`;

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.name} × ${item.quantity} — <strong>${formatUsd(item.lineTotal)}</strong></li>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <h1>Thanks for your order</h1>
    <p><strong>Order number:</strong> ${order.orderNumber}</p>
    <p><strong>Total:</strong> ${formatUsd(order.total)}</p>
    <ul>${itemsHtml}</ul>
    <p>We'll email you when your order ships.</p>
  </body>
</html>`;

  return { subject, text, html };
}
