// Shared order-status colors, used across the admin (orders list/detail,
// dashboard) and the storefront order-tracking page. Keyed by order status.
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#4ade80",
  cancelled: "#ef4444",
  refunded: "#9ca3af",
};
