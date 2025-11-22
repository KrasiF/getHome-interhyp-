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
          <p className="text-sm text-gray-600 mt-1">
            Found {listings.results.length} properties matching your criteria
          </p>
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
                    alt={`Property in ${listing.zip}`}
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
                    €{listing.buyingPrice.toLocaleString("de-DE")}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
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
                    €{Math.round(listing.buyingPrice / listing.squareMeter)}/m²
                  </p>
                </div>

                {/* Selection Button */}
                <Button
                  onClick={() => handleSelect(listing.id)}
                  className={`w-full mt-2 transition-all ${
                    isSelected
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {isSelected ? "✓ Selected" : "Select Home"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selected && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Selected Property</p>
          {listings.results
            .filter((l) => l.id === selected)
            .map((listing) => (
              <div
                key={listing.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-900">{listing.zip}</p>
                  <p className="text-sm text-gray-600">
                    {listing.squareMeter} m² • {listing.rooms} rooms
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  €{listing.buyingPrice.toLocaleString("de-DE")}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
