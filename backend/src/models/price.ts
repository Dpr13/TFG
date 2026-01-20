export interface Price {
  assetId: string;
  date: string; // ISO date string
  price: number;
  currency?: string;
}
