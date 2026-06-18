export interface OrderItem {
  productName: string;
  variantLabel: string;
  variantSku: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  /** Nullable in DB — phone TEXT (no NOT NULL constraint) */
  phone: string | null;
  address: string;
  city: string;
  /** province is an order-input field stored in checkout form state but has
   *  no dedicated column in the orders table. It flows through the API schema
   *  (app/api/orders/route.ts) as optional and is accepted for future use. */
  province?: string;
  postcode: string;
  country: string;
  shipping_method: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo_code?: string;
  status: string;
  tracking_number?: string;
  tracking_carrier?: string;
  notes?: string;
  created_at: string;
  /** updated_at exists in the DB (001_orders.sql) and is used by admin update flows */
  updated_at?: string;
}
