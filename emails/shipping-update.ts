export function orderShippingUpdateEmail(input: {
  orderNumber: string;
  trackingNumber: string | null;
}) {
  const subject = `Your WrapItUp order ${input.orderNumber} has shipped`;
  const trackingLine = input.trackingNumber
    ? `Tracking number: ${input.trackingNumber}`
    : "Tracking details will follow separately.";

  const text = `Good news — your order ${input.orderNumber} is on the way.

${trackingLine}`;

  const html = `<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif;">
  <p>Good news — your order <strong>${input.orderNumber}</strong> has shipped.</p>
  <p>${trackingLine}</p>
</body></html>`;

  return { subject, text, html };
}
