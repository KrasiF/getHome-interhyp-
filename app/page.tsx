"use client";
import {useState} from "react";
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
import {Check, ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();

  const steps = ["Personal Info", "Financials", "Dream Home"]; // labels
  const [step, setStep] = useState<number>(1);

  const cityOptions = [
    {city: "Berlin", region: "BE"},
    {city: "Hamburg", region: "HH"},
    {city: "Munich", region: "BY"},
    {city: "Cologne", region: "NW"},
    {city: "Frankfurt", region: "HE"},
  ];

  const dreamTypes = [
    {value: "HOUSEBUY", label: "House"},
    {value: "APPARTMENTBUY", label: "Apartment"},
    {value: "LANDBUY", label: "Land"},
  ];

  const [formData, setFormData] = useState({
    age: 30,
    jobTitle: "Software Engineer",
    salary: 50000,
    children: 0,
    capital: 10000,
    accomodation: "Flat in Munich",
    rent: 1200,
    savingsRate: 20,
    dreamLocation: "Munich",
    dreamRegion: "BY",
    dreamType: "HOUSEBUY",
  });
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
                <p className="font-medium mb-1">Age: {formData.age} years</p>
                <Slider
                  value={[formData.age]}
                  min={18}
                  max={100}
                  step={1}
                  onValueChange={(val) =>
                    setFormData({...formData, age: val[0]})
                  }
                />
              </div>

              <Input
                name="jobTitle"
                placeholder="Job Title"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({...formData, jobTitle: e.target.value})
                }
              />

              <div>
                <p className="font-medium mb-1">
                  Yearly Salary: €{formData.salary.toLocaleString()}
                </p>
                <Slider
                  value={[formData.salary]}
                  min={20000}
                  max={200000}
                  step={1000}
                  onValueChange={(val) =>
                    setFormData({...formData, salary: val[0]})
                  }
                />
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
                      setFormData({
                        ...formData,
                        children: formData.children - 1,
                      })
                    }
                    disabled={formData.children <= 0}
                  >
                    -
                  </Button>

                  <span className="w-8 text-center text-lg">
                    {formData.children}
                  </span>

                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        children: formData.children + 1,
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
                  Starting Capital: €{formData.capital.toLocaleString()}
                </p>
                <Slider
                  value={[formData.capital]}
                  min={0}
                  max={500000}
                  step={1000}
                  onValueChange={(val) =>
                    setFormData({...formData, capital: val[0]})
                  }
                />
              </div>

              <Input
                name="accomodation"
                placeholder="Current Accommodation"
                value={formData.accomodation}
                onChange={(e) =>
                  setFormData({...formData, accomodation: e.target.value})
                }
              />

              <div>
                <p className="font-medium mb-1">
                  Monthly Rent: €{formData.rent.toLocaleString()}
                </p>
                <Slider
                  value={[formData.rent]}
                  min={300}
                  max={5000}
                  step={50}
                  onValueChange={(val) =>
                    setFormData({...formData, rent: val[0]})
                  }
                />
              </div>

              <div>
                <p className="font-medium mb-1">
                  Savings Rate: {formData.savingsRate}%
                </p>
                <Slider
                  value={[formData.savingsRate]}
                  min={0}
                  max={80}
                  step={1}
                  onValueChange={(val) =>
                    setFormData({...formData, savingsRate: val[0]})
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
                      {formData.dreamLocation || "Select city"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cityOptions.map(({city, region}) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={() =>
                              setFormData({
                                ...formData,
                                dreamLocation: city,
                                dreamRegion: region,
                              })
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.dreamLocation === city
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {city}
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
                        dreamTypes.find((t) => t.value === formData.dreamType)
                          ?.label
                      }
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search type..." />
                      <CommandEmpty>No type found.</CommandEmpty>
                      <CommandGroup>
                        {dreamTypes.map((type) => (
                          <CommandItem
                            key={type.value}
                            value={type.value}
                            onSelect={() =>
                              setFormData({
                                ...formData,
                                dreamType:
                                  type.value as typeof formData.dreamType,
                              })
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.dreamType === type.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {type.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <p className="text-sm text-muted-foreground">
                This step will query the ThinkImmo API to find the best matching
                real-estate listings.
              </p>
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
                  /* define here to start game startGame(formData) */
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
