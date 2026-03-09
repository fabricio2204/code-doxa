export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'cafe' | 'bebidas' | 'doces' | 'salgados';
  image?: string | null;
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  displayCode?: string;
  items: CartItem[];
  total: number;
  status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';
  customerName: string;
  customerPhone?: string;
  createdAt: Date;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'atendente';
  password?: string;
}

export type UserRole = 'admin' | 'gerente' | 'atendente';
