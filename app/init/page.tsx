"use client";
import {useState, useEffect, useRef} from "react";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Slider} from "@/components/ui/slider";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {Skeleton} from "@/components/ui/skeleton";
import {Check, ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {StartStateModel} from "@/game/models/start-state-model";
import {GoalModel} from "@/game/models/goal-model";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {useGameEngine} from "@/components/game-engine-context";
import {Listings} from "@/components/listings";
import {scrapeApi, SearchParams} from "@/game/apis/scrape-api";
import {ScrapedListingsModel} from "@/game/models/scraped-listings-model";
import mockListingsData from "@/components/mock-listings.json";

export default function Init() {
  const {engine: gameEngine} = useGameEngine();
  const router = useRouter();

  const steps = ["Personal Info", "Financials", "Dream Home"]; // labels
  const [step, setStep] = useState<number>(1);

  const cityOptions = [
    {city: "Berlin", zip: "10115"},
    {city: "Hamburg", zip: "20095"},
    {city: "München", zip: "80331"},
    {city: "Köln", zip: "50667"},
    {city: "Frankfurt", zip: "60311"},
  ];

  const estateTypes = [
    {value: "HOUSEBUY", label: "House"},
    {value: "APPARTMENTBUY", label: "Apartment"},
  ];

  const [startState, setStartState] = useState<StartStateModel>({
    age: 30,
    occupation: {
      occupationDescription: "",
      occupationTitle: "Software Engineer",
      stressLevelFrom0To100: 50,
      yearlySalaryInEuro: 60000,
    },
    amountOfChildren: 0,
    portfolio: {cashInEuro: 10000, cryptoInEuro: 0, etfInEuro: 0},
    living: {
      zip: "80538",
      yearlyRentInEuro: 12000,
      sizeInSquareMeter: 12,
    },
    savingsRateInPercent: 20,
    married: false,
  });

  const [goal, setGoal] = useState<GoalModel>({
    buyingPrice: 400000,
    rooms: 3,
    squareMeter: 105,
    zip: "80331",
    numberWishedChildren: 0,
    estateType: "HOUSEBUY",
  });

  const [listings, setListings] = useState<ScrapedListingsModel>({
    results: [],
  });
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (!selectedHomeId) return;
    const found = listings.results.find((l) => l.id === selectedHomeId);
    if (!found) return;

    // Mark that the next automatic fetch (triggered by goal changes)
    // should be skipped because this update originates from a listing selection.
    skipNextFetchRef.current = true;

    setGoal((prev) => ({
      ...prev,
      buyingPrice: found.buyingPrice ?? prev.buyingPrice,
      rooms: found.rooms ?? prev.rooms,
      squareMeter: found.squareMeter ?? prev.squareMeter,
    }));
  }, [selectedHomeId, listings.results]);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    if (step === 3) {
      const fetchListings = async () => {
        setIsLoadingListings(true);
        try {
          const currentCity = "Berlin"; // Default fallback
          const city =
            cityOptions.find((c) => c.zip === goal.zip)?.city || currentCity;
          console.log(city);
          const searchParams: SearchParams = {
            city,
            estateType: goal.estateType as "HOUSEBUY" | "APARTMENTBUY",
            squareMeters: goal.squareMeter,
          };
          const results = await scrapeApi(searchParams);
          setListings(results);
        } catch (error) {
          console.error("Error fetching listings:", error);
          // Use mock listings as fallback - transform mock data to match ListingModel
          type MockListingRaw = {
            id: string | number;
            buyingPrice: string | number;
            zip: string | number;
            rooms: string | number;
            squareMeter: string | number;
            images?: Array<{originalUrl?: string} | null> | null;
          };
          const mockResults: ScrapedListingsModel = {
            results: (mockListingsData.results as unknown as MockListingRaw[])
              .slice(0, 10)
              .map((listing) => ({
                id: String(listing.id),
                buyingPrice: Number(listing.buyingPrice),
                zip: String(listing.zip),
                rooms: Number(listing.rooms),
                squareMeter: Number(listing.squareMeter),
                imageUrl: String(listing.images?.[0]?.originalUrl || ""),
              })),
          };
          setListings(mockResults);
        } finally {
          setIsLoadingListings(false);
        }
      };

      fetchListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.zip, goal.estateType, goal.squareMeter, step]);

  const totalSteps = steps.length;
  const progress = (step / totalSteps) * 100;

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-8">
      {/* Step tracker */}
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const num = index + 1;
          const done = num < step;
          const active = num === step;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full border",
                  done && "bg-green-500 text-white border-green-500",
                  active && "bg-primary text-white border-primary",
                  !done && !active && "bg-muted"
                )}
              >
                {done ? "✓" : num}
              </div>
              <p className="text-xs mt-1 text-center opacity-80">{label}</p>
            </div>
          );
        })}
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Your Personal Information"}
            {step === 2 && "Financial Status"}
            {step === 3 && "Dream Home Preferences"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Age: {startState.age} years</p>
                <Slider
                  value={[startState.age]}
                  min={18}
                  max={100}
                  step={1}
                  onValueChange={(val) =>
                    setStartState({...startState, age: val[0]})
                  }
                />
              </div>

              <div>
                <p className="font-medium mb-1">Jobtitle</p>
                <Input
                  name="jobTitle"
                  placeholder="Job Title"
                  value={startState.occupation.occupationTitle}
                  onChange={(e) =>
                    setStartState({
                      ...startState,
                      occupation: {
                        ...startState.occupation,
                        occupationTitle: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <p className="font-medium mb-1">
                  Yearly Salary: €
                  {startState.occupation.yearlySalaryInEuro.toLocaleString(
                    "de-DE"
                  )}
                </p>
                <Slider
                  value={[startState.occupation.yearlySalaryInEuro]}
                  min={10000}
                  max={500000}
                  step={1000}
                  onValueChange={(val) =>
                    setStartState({
                      ...startState,
                      occupation: {
                        ...startState.occupation,
                        yearlySalaryInEuro: val[0],
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="married"
                  checked={startState.married}
                  onCheckedChange={(checked) =>
                    setStartState({...startState, married: Boolean(checked)})
                  }
                />
                <Label htmlFor="married" className="font-medium">
                  Are you married?
                </Label>
              </div>

              <div>
                <p className="font-medium mb-1">
                  How many children do you have?
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setStartState({
                        ...startState,
                        amountOfChildren: startState.amountOfChildren! - 1,
                      })
                    }
                    disabled={startState.amountOfChildren! <= 0}
                  >
                    -
                  </Button>

                  <span className="w-8 text-center text-lg">
                    {startState.amountOfChildren!}
                  </span>

                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setStartState({
                        ...startState,
                        amountOfChildren: startState.amountOfChildren! + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-medium mb-1">
                  How many children do you wish to have?
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setGoal({
                        ...goal,
                        numberWishedChildren: goal.numberWishedChildren! - 1,
                      })
                    }
                    disabled={goal.numberWishedChildren! <= 0}
                  >
                    -
                  </Button>

                  <span className="w-8 text-center text-lg">
                    {goal.numberWishedChildren!}
                  </span>

                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setGoal({
                        ...goal,
                        numberWishedChildren: goal.numberWishedChildren! + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">
                  Starting Capital: €
                  {startState.portfolio.cashInEuro.toLocaleString("de-DE")}
                </p>
                <Slider
                  value={[startState.portfolio.cashInEuro]}
                  min={0}
                  max={500000}
                  step={1000}
                  onValueChange={(val) =>
                    setStartState({
                      ...startState,
                      portfolio: {...startState.portfolio, cashInEuro: val[0]},
                    })
                  }
                />
              </div>

              <div>
                <p className="font-medium mb-1">
                  Monthly Rent: €
                  {new Intl.NumberFormat("de-DE").format(
                    Math.round(startState.living.yearlyRentInEuro / 12)
                  )}
                </p>
                <Slider
                  value={[startState.living.yearlyRentInEuro]}
                  min={1200}
                  max={120000}
                  step={120}
                  onValueChange={(val) =>
                    setStartState({
                      ...startState,
                      living: {...startState.living, yearlyRentInEuro: val[0]},
                    })
                  }
                />
              </div>

              <div>
                <p className="font-medium mb-1">
                  Savings Rate: {startState.savingsRateInPercent}%
                </p>
                <Slider
                  value={[startState.savingsRateInPercent]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={(val) =>
                    setStartState({...startState, savingsRateInPercent: val[0]})
                  }
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Location Combobox */}
              <div>
                <p className="font-medium mb-1">Dream City</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {cityOptions.find((city) => city.zip === goal.zip)
                        ?.city || "Select city"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cityOptions.map(({zip}) => (
                          <CommandItem
                            key={zip}
                            value={zip}
                            onSelect={() =>
                              setGoal({
                                ...goal,
                                zip,
                              })
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                goal.zip === zip ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cityOptions.find((city) => city.zip == zip)?.city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Real Estate Type */}
              <div>
                <p className="font-medium mb-1">Real Estate Type</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {
                        estateTypes.find(
                          (estate) => estate.value === goal.estateType
                        )?.label
                      }
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search type..." />
                      <CommandEmpty>No type found.</CommandEmpty>
                      <CommandGroup>
                        {estateTypes.map((estate) => (
                          <CommandItem
                            key={estate.value}
                            value={estate.value}
                            onSelect={() =>
                              setGoal({...goal, estateType: estate.value})
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                goal.estateType === estate.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {estate.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <p className="font-medium mb-1">
                  Square Meters: {goal.squareMeter} m²
                </p>
                <Slider
                  value={[goal.squareMeter]}
                  min={0}
                  max={800}
                  step={5}
                  onValueChange={(val) =>
                    setGoal({
                      ...goal,
                      squareMeter: val[0],
                    })
                  }
                />
              </div>

              {/* Listings Section */}
              <div className="border-t pt-6 mt-6">
                {isLoadingListings ? (
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          {/* Image skeleton */}
                          <Skeleton className="w-full h-48" />

                          {/* Content skeleton */}
                          <div className="p-4 space-y-3">
                            {/* Location */}
                            <Skeleton className="h-4 w-24" />

                            {/* Property Details */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <div className="space-y-2">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            </div>

                            {/* Price per sqm */}
                            <div className="pt-2 border-t border-gray-200 space-y-2">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-32" />
                            </div>

                            {/* Button skeleton */}
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Listings
                    listings={listings}
                    onSelectHome={setSelectedHomeId}
                    selectedId={selectedHomeId}
                  />
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button variant="outline" onClick={back}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button onClick={next}>Next</Button>
            ) : (
              <Button
                onClick={() => {
                  gameEngine.startGame(startState, goal);

                  router.push("/simulation");
                }}
              >
                Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
