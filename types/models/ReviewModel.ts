interface ReviewItemModel {
  id: number;
  name: string;
  avatar: string;
  reviewer: number;
  comment: string;
  imageUrls: string[];
  rating: number;
  createdDate: string;
}

interface ReviewModel {
  orderId: number;
  description: string;
  reviews: ReviewItemModel[];
}
