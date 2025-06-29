export class PaginationModel {
    pageIndex: number = 0;
    page?: number;
    pageSize: number = 10;
    total?: number;
    totalPage?: number;
}
export interface Dish {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  price: number;
  image_url?: string;
  thumbnail_urls?: string[];
  category_id: number;
  ingredients?: string;
  allergens?: string;
  nutritional_info?: string;
  availability?: boolean;
  preparation_time?: number;
  is_recommended?: boolean;
  inventory?: number;
  created_by?: string;
  created_date_time?: Date;
  category?: Category; // For populated queries
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  created_date_time?: Date;
  dishes?: Dish[]; // For populated queries
}

export interface Order {
  id?: number;
  customer_id: number;
  total_amount: number;
  shipping_fee: number;
  status: string;
  delivery_address?: string;
  phone_number?: string;
  special_instructions?: string;
  order_date?: Date;
  estimated_delivery_time?: Date;
  created_by?: string;
  created_date_time?: Date;
  customer?: Customer; // For populated queries
  items?: OrderItem[]; // For populated queries
}

export interface OrderItem {
  id?: number;
  order_id: number;
  dish_id: number;
  quantity: number;
  price?: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  created_date_time?: Date;
  order?: Order; // For populated queries
  dish?: Dish; // For populated queries
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone_number?: string;
  preferences?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  created_date_time?: Date;
  orders?: Order[]; // For populated queries
  carts?: Cart[]; // For populated queries
}

export interface Cart {
  id?: number;
  customer_id: number;
  session_id: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  created_date_time?: Date;
  customer?: Customer; // For populated queries
  items?: CartItem[]; // For populated queries
}

export interface CartItem {
  id?: number;
  cart_id: number;
  dish_id: number;
  quantity: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  created_date_time?: Date;
  cart?: Cart; // For populated queries
  dish?: Dish; // For populated queries
}

export interface ShippingOption {
  id?: number;
  name: string;
  fee?: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  created_date_time?: Date;
}

// Cart state management
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
}

// Order calculation
export interface OrderCalculation {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  taxRate: number;
}

// Filter and search interfaces
export interface DishFilter {
  categoryId?: number;
  priceMin?: number;
  priceMax?: number;
  isRecommended?: boolean;
  availability?: boolean;
  search?: string;
  sortBy?: SortOption;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}


export interface PageContent {
  // Define the properties of your page content model here
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  // ...other fields as needed
}