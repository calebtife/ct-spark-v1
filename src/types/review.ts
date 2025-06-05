export interface Review {
  id: number;
  name: string;
  title: string;
  review: string;
  role: string;
  rating: number;
  imageUrl?: string;
}

export interface ReviewHeaderProps {
  subtitle: string;
  title: string;
}

export interface ReviewCardProps {
  name: string;
  title: string;
  review: string;
  role: string;
  rating?: number;
  imageUrl?: string;
} 