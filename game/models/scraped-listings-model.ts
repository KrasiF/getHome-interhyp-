interface ListingModel {
  id: string;
  buyingPrice: number;
  zip: string;
  rooms: number;
  squareMeter: number;
  imageUrl: string;
}

export interface ScrapedListingsModel {
  results: ListingModel[]; // 0, 1, 10
}
