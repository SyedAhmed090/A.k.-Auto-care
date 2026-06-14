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
  phone: string;
  address: string;
  city: string;
  province: string;
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
}
