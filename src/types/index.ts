export interface Category {
  id: number;
  name: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  avatar: string;
}

export interface Order {
  orderId: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderHistory {
  [email: string]: Order[];
}
