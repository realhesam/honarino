export interface BuilderType {
  id: number;
  name: string;
  slug: string;
  logo: string;
  city: string;
  rate: number;
  verified: boolean;
  productsCount: number;
  viewsCount: number;
  categories: string[];
  bio: string;
}
