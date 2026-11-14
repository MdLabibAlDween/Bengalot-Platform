export function paymentMethodLabel(method: string) {
  switch (method) {
    case "cod":
      return "Cash on delivery";
    case "zinipay":
      return "ZiniPay";
    case "bkash":
      return "bKash";
    default:
      return method;
  }
}

export function paymentStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Paid";
    case "refunded":
      return "Refunded";
    case "pending":
      return "Payment pending";
    default:
      return status;
  }
}
