"use client";

import {useState} from "react";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CheckCircle2, MapPin, Ruler, DoorOpen} from "lucide-react";
import {ScrapedListingsModel} from "@/game/models/scraped-listings-model";

interface ListingsProps {
  listings: ScrapedListingsModel;
  onSelectHome?: (listingId: string) => void;
  selectedId?: string | null;
}

export function Listings({
  listings,
  onSelectHome,
  selectedId = null,
}: ListingsProps) {
  const [selected, setSelected] = useState<string | null>(selectedId || null);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelectHome?.(id);
  };

  if (!listings.results || listings.results.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">
          No listings found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Available Homes</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">Powered by</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 85"
              height="16"
              className="opacity-60"
            >
              <defs>
                <clipPath id="a">
                  <path d="M0 0h400v85H0z"></path>
                </clipPath>
              </defs>
              <g clipPath="url(#a)">
                <g>
                  <path
                    d="M38.56 9.533A29.027 29.027 0 1067.587 38.56 29.032 29.032 0 0038.56 9.533m0-9.533A38.567 38.567 0 110 38.56 38.606 38.606 0 0138.56 0z"
                    fill="#999"
                  ></path>
                </g>
                <g>
                  <path
                    d="M101.173 9.547a5.665 5.665 0 015.8 5.8 5.8 5.8 0 11-11.6 0 5.657 5.657 0 015.8-5.8zM96.2 26.96h9.533v40.627H96.2z"
                    fill="#999"
                  ></path>
                  <path
                    d="M116.506 26.96h9.533v5.8h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.41v24.057h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.534V26.96z"
                    fill="#999"
                  ></path>
                  <path
                    d="M166.843 36.907h-7.47v-9.12h4.147c2.907 0 4.147-1.24 4.147-4.56v-8.293h8.707v12.853h9.12v9.12h-9.12v16.174c0 4.147 2.067 6.213 5.387 6.213a13.534 13.534 0 004.973-1.16v9.04a19.649 19.649 0 01-7.053 1.24c-7.88 0-12.853-4.973-12.853-14.093V36.907z"
                    fill="#999"
                  ></path>
                  <path
                    d="M230.266 61.374s-5.387 7.053-17 7.053a21.149 21.149 0 11-.413-42.293c11.613 0 19.907 9.12 19.907 20.32a25.97 25.97 0 01-.413 4.56h-30.268c1 4.56 4.973 8.707 11.613 8.707a15.411 15.411 0 0011.2-5.053zm-7.867-18.24c-1.24-4.56-4.56-7.88-9.947-7.88-5.8 0-9.12 3.32-10.36 7.88z"
                    fill="#999"
                  ></path>
                  <path
                    d="M240.213 26.96h9.533v5.8h.413s4.147-6.64 11.613-6.64h1.653v10.36a11.485 11.485 0 00-3.32-.413c-5.8 0-10.36 4.56-10.36 11.613v19.907h-9.532z"
                    fill="#999"
                  ></path>
                  <path
                    d="M270.48 9.547h9.533V32.76h.413s4.147-6.64 12.027-6.64c8.707 0 15.347 6.64 15.347 17.413v24.054h-9.533v-22.72c0-5.893-3.32-9.2-8.293-9.2-5.8 0-9.947 4.147-9.947 10.36v21.56h-9.533V9.547z"
                    fill="#999"
                  ></path>
                  <path
                    d="M314.173 74.64a10.518 10.518 0 004.973 1.24c3.733 0 5.64-2.16 7.053-5.387l1.24-2.907-16.173-40.626h10.36l10.79 28.2h.413l10.36-28.2h10.36l-17.416 44.36c-3.4 8.707-7.88 13.68-14.933 13.68a21.445 21.445 0 01-7.053-1.24v-9.12z"
                    fill="#999"
                  ></path>
                  <path
                    d="M358.533 26.96h9.533v5.8h.413s3.733-6.64 13.267-6.64 18.253 8.72 18.253 21.16-8.706 21.15-18.239 21.15-13.267-6.64-13.267-6.64h-.413V85h-9.533V26.96zm31.933 20.32a11.207 11.207 0 10-22.4 0 11.207 11.207 0 1022.4 0z"
                    fill="#999"
                  ></path>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.results.map((listing) => {
          const isSelected = selected === listing.id;
          return (
            <Card
              key={listing.id}
              className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleSelect(listing.id)}
            >
              {/* Image Container */}
              <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                {listing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.imageUrl}
                    alt={
                      listing.title
                        ? listing.title
                        : `Property in ${listing.zip}`
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Ruler className="text-gray-500" size={32} />
                  </div>
                )}

                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <CheckCircle2 size={20} />
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-2 left-2 bg-white rounded-lg px-3 py-1 shadow-md">
                  <p className="font-bold text-lg text-gray-900">
                    €{listing.buyingPrice?.toLocaleString("de-DE")}
                  </p>
                </div>
              </div>
              {/* Title */}
              <div className="p-4 font-light">
                <p className="text-sm font-semibold text-gray-900">
                  {listing.title ?? listing.zip}
                </p>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 flex flex-col flex-1">
                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-gray-900">
                    {listing.zip}
                  </p>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Ruler size={16} className="text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Size</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.squareMeter} m²
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <DoorOpen size={16} className="text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Rooms</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {listing.rooms}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price per sqm */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Price per m²</p>
                  <p className="text-sm font-semibold text-gray-900">
                    €
                    {Math.round(
                      listing.buyingPrice / listing.squareMeter
                    ).toLocaleString("de-DE")}
                    /m²
                  </p>
                </div>

                {/* Selection Button - footer aligned */}
                <div className="mt-auto pt-2 border-t border-gray-100 w-full">
                  <Button
                    onClick={() => handleSelect(listing.id)}
                    className={`w-full h-10 flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={16} />{" "}
                        <span className="font-medium">Selected</span>
                      </>
                    ) : (
                      <span className="font-medium">Select Home</span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selected && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Selected Property</p>
          {listings.results
            .filter((l) => l.id === selected)
            .map((listing) => (
              <div
                key={listing.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
              >
                <div className="col-span-1 w-full h-28 bg-gray-100 overflow-hidden rounded">
                  {listing.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.imageUrl}
                      alt={listing.title ?? listing.zip}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ruler className="text-gray-400" size={28} />
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {listing.title ?? listing.zip}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ZIP: {listing.zip}
                  </p>
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <div>
                      Size:{" "}
                      <span className="font-medium">
                        {listing.squareMeter} m²
                      </span>
                    </div>
                    <div>
                      Rooms:{" "}
                      <span className="font-medium">{listing.rooms}</span>
                    </div>
                    <div>
                      Price:{" "}
                      <span className="font-medium">
                        €{listing.buyingPrice.toLocaleString("de-DE")}
                      </span>
                    </div>
                    <div>
                      Price / m²:{" "}
                      <span className="font-medium">
                        €
                        {Math.round(
                          listing.buyingPrice / listing.squareMeter
                        ).toLocaleString("de-DE")}
                        /m²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 flex items-start md:items-center md:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Buying Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      €{Math.round(listing.buyingPrice).toLocaleString("de-DE")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
