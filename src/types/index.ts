export type Role = 'admin' | 'user' | 'reseller' | 'support';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
}

// Re-export Domain Entity as the main Product type
export type { Product } from '@/domain/entities/Product';

export interface CatalogFilter {
  query: string;
  category: string;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  size?: string;
  product_name?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  total_amount: number;
  status: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
  items: OrderItem[];
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_spent: number;
  last_purchase?: string;
  created_at: string;
}

export type MessageStatus = 'unread' | 'read' | 'archived';

export interface Message {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
  is_admin_reply?: boolean;
}
