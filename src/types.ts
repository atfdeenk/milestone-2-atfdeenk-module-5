export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}
