import {ScrapedListingsModel} from "../models/scraped-listings-model";

async function fetchListings(
  city: string,
  type: string,
  from: number,
  size: number
) {
  const response = await fetch("https://thinkimmo-api.mgraetz.de/thinkimmo", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      active: true,
      type,
      sortBy: "asc",
      sortKey: "squareMeter",
      from,
      size,
      geoSearches: {geoSearchQuery: city, geoSearchType: "city"},
    }),
  });
  return await response.json();
}

export async function scrapeApi(
  searchParams: SearchParams
): Promise<ScrapedListingsModel> {
  // Step 1: Get total count
  const initial = await fetchListings(
    searchParams.city,
    searchParams.estateType,
    0,
    1
  );
  const total = initial.total;

  if (total === 0) return {results: []};

  // Step 2: Check middle 20
  const mid = Math.floor(total / 2);
  const midData = await fetchListings(
    searchParams.city,
    searchParams.estateType,
    mid - 10,
    20
  );

  const min = searchParams.squareMeters * 0.8;
  const max = searchParams.squareMeters * 1.2;

  // Step 3: Binary search
  let left = 0;
  let right = total - 1;

  while (left < right) {
    const midPoint = Math.floor((left + right) / 2);
    const check = await fetchListings(
      searchParams.city,
      searchParams.estateType,
      midPoint,
      1
    );

    if (check.results[0]?.squareMeter < min) {
      left = midPoint + 1;
    } else {
      right = midPoint;
    }
  }

  // Fetch results around found position
  const final = await fetchListings(
    searchParams.city,
    searchParams.estateType,
    Math.max(0, left - 5),
    50
  );

  const results = final.results
    .filter((l: any) => l.squareMeter >= min && l.squareMeter <= max)
    .slice(0, 10)
    .map((l: any) => ({
      id: l.id,
      title: l.title,
      buyingPrice: l.buyingPrice,
      zip: l.zip || "",
      rooms: l.rooms || 0,
      squareMeter: l.squareMeter,
      imageUrl: l.images?.[0]?.originalUrl || "",
    }));

  return {results};
}

export interface SearchParams {
  city: string;
  estateType: "HOUSEBUY" | "APARTMENTBUY";
  squareMeters: number;
}
