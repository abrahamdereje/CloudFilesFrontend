export interface Category {
  id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_path: string
  order: number
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  title?: string
  description?: string
  price?: number
  original_price?: number
  discount_percentage?: number
  main_image?: string
  dimensions?: string
  material?: string
  category_id?: number
  category?: Category
  categories?: Category[]
  images?: ProductImage[]
  is_active: boolean
  is_featured?: boolean
  stock_status?: 'in_stock' | 'out_of_stock'
  quantity?: number | null
  created_at?: string
  updated_at?: string
}

export interface NewsItem {
  id: number
  title: string
  subtitle?: string
  author?: string
  excerpt?: string
  body: string
  image?: string
  featured_image?: string
  category_id?: number
  category?: Category
  categories?: string[]
  is_published: boolean
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface BlogPost {
  id: number
  title: string
  subtitle?: string
  author?: string
  excerpt?: string
  body: string
  image?: string
  category_id?: number
  category?: Category
  categories?: string[]
  is_published: boolean
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'editor' | 'admin'
  created_at?: string
  updated_at?: string
}

