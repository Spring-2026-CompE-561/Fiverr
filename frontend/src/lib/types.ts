export type UserRole = "buyer" | "seller";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface GigPublic {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderPublic {
  id: string;
  gig_id: string;
  buyer_id: string;
  buyer_name: string;
  gig_title: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ReviewPublic {
  id: string;
  gig_id: string;
  buyer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserPublic;
}
