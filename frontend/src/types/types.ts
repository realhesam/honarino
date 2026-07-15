export type ProductType = {
  id: string | number;
  cover: string;
  alt: string;
  name: string;
  builder: string;
  builderSlug: string;
  slug: string;
  caption: string;
  category: string;
  city: string;
  rate: number;
  price: number;
  offerPrice: number;
  offer: number;
  isNew?: boolean;
  viewsCount?: number;
};

export type CommentType = {
  id: string | number;
  comment: string;
  rate: number;
  user: {
    cover: string;
    name: string;
  };
};

export type BuilderType = {
  id: number;
  name: string;
  slug: string;
  logo: string;
  city: string;
  rate: number;
  verified: boolean;
  productsCount: number;
  viewsCount: number;
  badges?: string[];
};

export type ProductShowcaseMode = "new" | "popular" | "category" | "city";
export type BuilderShowcaseMode = "top" | "verified" | "city" | "popular";
