export type GigPublic = {
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
};

export type OrderPublic = {
  id: string;
  gig_id: string;
  buyer_id: string;
  buyer_name: string;
  gig_title: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  updated_at: string;
};

export type ReviewPublic = {
  id: string;
  gig_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
