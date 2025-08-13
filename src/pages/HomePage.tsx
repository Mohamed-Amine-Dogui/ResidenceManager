import type React from "react";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Upload,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addMonths } from "date-fns";
import { Slider } from "@/components/ui/slider";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data for properties
const mockProperties = [
  {
    id: 0,
    title: "Riad authentique",
    location: "Bizerte",
    coordinates: { lat: 37.2644, lng: 9.8639 },
    price: 320,
    rating: 4.8,
    reviews: 167,
    images: ["/houses/maison_2.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 1,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/hotel_nour.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 2,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/maison_3.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 3,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/residence_ain_meriem.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },

  {
    id: 4,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/hotel_nour.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 5,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/maison_3.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 6,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/residence_ain_meriem.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 7,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/hotel_nour.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 8,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/maison_3.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 9,
    title: "Villa moderne avec piscine",
    location: "Bizerte",
    coordinates: { lat: 37.2744, lng: 9.8739 },
    price: 258,
    rating: 4.8,
    reviews: 124,
    images: ["/houses/residence_ain_meriem.jpg"],
    hostType: "Superhost",
    available: true,
    maxGuests: 8,
  },
  {
    id: 4,
    title: "Appartement vue mer",
    location: "Tunis",
    coordinates: { lat: 36.8065, lng: 10.1815 },
    price: 404,
    rating: 4.9,
    reviews: 89,
    images: ["/placeholder.svg?height=200&width=300&text=Appartement+Tunis"],
    hostType: "Hôte",
    available: true,
    maxGuests: 4,
  },
  {
    id: 6,
    title: "Maison traditionnelle",
    location: "Sousse",
    coordinates: { lat: 35.8256, lng: 10.6369 },
    price: 180,
    rating: 4.7,
    reviews: 156,
    images: ["/placeholder.svg?height=200&width=300&text=Maison+Sousse"],
    hostType: "Hôte",
    available: true,
    maxGuests: 6,
  },
  {
    id: 7,
    title: "Studio cosy centre-ville",
    location: "Hammamet",
    coordinates: { lat: 36.4, lng: 10.6167 },
    price: 95,
    rating: 4.6,
    reviews: 78,
    images: ["/placeholder.svg?height=200&width=300&text=Studio+Hammamet"],
    hostType: "Hôte",
    available: true,
    maxGuests: 2,
  },
  {
    id: 8,
    title: "Villa de luxe avec jardin",
    location: "Djerba",
    coordinates: { lat: 33.8076, lng: 10.8451 },
    price: 520,
    rating: 4.9,
    reviews: 203,
    images: ["/placeholder.svg?height=200&width=300&text=Villa+Djerba"],
    hostType: "Superhost",
    available: true,
    maxGuests: 10,
  },
];

const cities = ["Bizerte", "Tunis", "Sousse", "Hammamet", "Djerba"];

const flexibilityOptions = [
  { label: "Dates exactes", value: 0 },
  { label: "±1 jour", value: 1 },
  { label: "±2 jours", value: 2 },
  { label: "±3 jours", value: 3 },
  { label: "±7 jours", value: 7 },
  { label: "±14 jours", value: 14 },
];

interface SearchFilters {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
    babies: number;
  };
  flexibility: number;
}

interface PropertyCardProps {
  property: (typeof mockProperties)[0];
  onFavorite?: (id: number) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavorite,
  isFavorite = false,
}) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative mb-3">
        <img
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 rounded-full w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(property.id);
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"
            )}
          />
        </Button>
        {property.hostType === "Superhost" && (
          <Badge className="absolute top-3 left-3 bg-white text-slate-900 text-xs px-2 py-1 rounded-md">
            Coup de cœur voyageurs
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
            {property.title}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-slate-900 text-slate-900 dark:fill-slate-50 dark:text-slate-50" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
              {property.rating}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {property.location}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">15-17 août</p>
        <div className="flex items-baseline space-x-1">
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            {property.price}€
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            pour 2 nuits
          </span>
        </div>
      </div>
    </div>
  );
};

const MapView: React.FC<{
  properties: typeof mockProperties;
  onPropertyHover?: (id: number | null) => void;
}> = ({ properties, onPropertyHover }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={cn(
        "relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50" : "h-[600px]"
      )}
    >
      {/* Map placeholder */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">
            Carte interactive
          </p>
        </div>
      </div>

      {/* Price markers */}
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 shadow-lg cursor-pointer hover:scale-110 transition-transform"
          style={{
            top: `${20 + index * 15}%`,
            left: `${30 + index * 10}%`,
          }}
          onMouseEnter={() => onPropertyHover?.(property.id)}
          onMouseLeave={() => onPropertyHover?.(null)}
        >
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            {property.price}€
          </span>
        </div>
      ))}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-slate-900"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-slate-900"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-slate-900"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <X className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const PropertyCarousel: React.FC<{
  title: string;
  properties: typeof mockProperties;
}> = ({ title, properties }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : Math.max(0, properties.length - 3)
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < properties.length - 3 ? prev + 1 : 0));
  };

  const handleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= properties.length - 3}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
        {properties.slice(currentIndex, currentIndex + 6).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onFavorite={handleFavorite}
            isFavorite={favorites.includes(property.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MonthDial: React.FC<{ value: number; max?: number }> = ({
  value,
  max = 12,
}) => {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-48 h-48 rotate-[-90deg]" viewBox="0 0 200 200">
        {/* track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="18"
        />
        {/* progress */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          className="stroke-pink-500"
          strokeWidth="18"
        />
      </svg>

      {/* center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            {value}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">mois</div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    destination: "",
    checkIn: undefined,
    checkOut: undefined,
    guests: { adults: 0, children: 0, babies: 0 },
    flexibility: 0,
  });
  const [monthsAhead, setMonthsAhead] = useState(6); // default 6 months

  const [showResults, setShowResults] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateModalType, setDateModalType] = useState<"checkin" | "checkout">(
    "checkin"
  );
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);

  const filteredProperties = mockProperties.filter((property) => {
    if (
      searchFilters.destination &&
      !property.location
        .toLowerCase()
        .includes(searchFilters.destination.toLowerCase())
    ) {
      return false;
    }
    const totalGuests =
      searchFilters.guests.adults + searchFilters.guests.children;
    if (totalGuests > 0 && property.maxGuests < totalGuests) {
      return false;
    }
    return true;
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (!searchFilters.destination) {
      toast.error("Veuillez sélectionner une destination");
      return;
    }
    setShowResults(true);
    toast.success(`${filteredProperties.length} logements trouvés`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSearchFilters((prev) => {
      if (!date) return prev;

      if (dateModalType === "checkin") {
        // If new check-in is after current check-out, clear check-out
        const shouldClearCheckout = prev.checkOut && date > prev.checkOut;
        return {
          ...prev,
          checkIn: date,
          checkOut: shouldClearCheckout ? undefined : prev.checkOut,
        };
      } else {
        // If setting check-out before current check-in, swap or set check-in to the same day
        if (prev.checkIn && date < prev.checkIn) {
          return {
            ...prev,
            checkIn: date,
            checkOut: undefined,
          };
        }
        return { ...prev, checkOut: date };
      }
    });
    // Keep the dialog open so the user can set both dates;
    // close only if you want to auto-close after each pick:
    // setDateModalOpen(false)
  };

  const updateGuestCount = (
    type: keyof SearchFilters["guests"],
    increment: boolean
  ) => {
    setSearchFilters((prev) => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: Math.max(0, prev.guests[type] + (increment ? 1 : -1)),
      },
    }));
  };

  const getTotalGuests = () => {
    const { adults, children, babies } = searchFilters.guests;
    return adults + children + babies;
  };

  const getGuestsText = () => {
    const total = getTotalGuests();
    if (total === 0) return "Voyageurs";
    if (total === 1) return "1 voyageur";
    return `${total} voyageurs`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {logo ? (
              <img
                src={logo || "/placeholder.svg"}
                alt="Logo"
                className="h-10 w-auto"
              />
            ) : (
              <div className="relative">
                <div className="h-10 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Upload className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Become Host Button */}
          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-800 bg-transparent"
          >
            Devenir hôte
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 mb-8">
          airbnb-Tunsi
        </h1>

        {/* Search Bar - Responsive */}
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="
      bg-white dark:bg-slate-950
      rounded-2xl md:rounded-full         /* no pill on mobile, pill on md+ */
      shadow-lg border border-slate-200 dark:border-slate-800
      p-3 md:p-2
      overflow-hidden
    "
          >
            <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-0">
              {/* Destination */}
              <div className="px-3 py-2 md:px-4 md:py-3 md:border-r border-slate-200 dark:border-slate-800 flex justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    Destination
                  </div>
                  <Input
                    placeholder="Rechercher une destination"
                    value={searchFilters.destination}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                    className="border-0 p-0 text-sm placeholder:text-slate-400 focus-visible:ring-0 bg-transparent w-auto mx-auto text-center"
                  />
                </div>
              </div>

              {/* Check-in */}
              <div className="px-3 py-2 md:px-4 md:py-3 md:border-r border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-1">
                  Arrivée
                </div>
                <Button
                  variant="ghost"
                  className="p-0 h-auto justify-start text-left font-normal text-sm text-slate-400 hover:bg-transparent"
                  onClick={() => {
                    setDateModalType("checkin");
                    setDateModalOpen(true);
                  }}
                >
                  {searchFilters.checkIn
                    ? format(searchFilters.checkIn, "dd MMM", { locale: fr })
                    : "Quand ?"}
                </Button>
              </div>

              {/* Check-out */}
              <div className="px-3 py-2 md:px-4 md:py-3 md:border-r border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-1">
                  Départ
                </div>
                <Button
                  variant="ghost"
                  className="p-0 h-auto justify-start text-left font-normal text-sm text-slate-400 hover:bg-transparent"
                  onClick={() => {
                    setDateModalType("checkout");
                    setDateModalOpen(true);
                  }}
                >
                  {searchFilters.checkOut
                    ? format(searchFilters.checkOut, "dd MMM", { locale: fr })
                    : "Quand ?"}
                </Button>
              </div>

              {/* Guests + Search */}
              <div className="px-3 py-2 md:px-4 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    Voyageurs
                  </div>
                  <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto justify-start text-left font-normal text-sm text-slate-400 hover:bg-transparent"
                      >
                        {getTotalGuests() > 0
                          ? getGuestsText()
                          : "Ajouter des personnes"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <div className="space-y-4">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">
                              Adultes
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount("adults", false)}
                              disabled={searchFilters.guests.adults === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-slate-900 dark:text-slate-50">
                              {searchFilters.guests.adults}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount("adults", true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">
                              Enfants
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              de 2 à 12 ans
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateGuestCount("children", false)
                              }
                              disabled={searchFilters.guests.children === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-slate-900 dark:text-slate-50">
                              {searchFilters.guests.children}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount("children", true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Babies */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-50">
                              Bébés
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount("babies", false)}
                              disabled={searchFilters.guests.babies === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-slate-900 dark:text-slate-50">
                              {searchFilters.guests.babies}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateGuestCount("babies", true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Action buttons centered */}
                <div className="flex gap-2 justify-center">
                  {/* Effacer tout - only on mobile */}
                  <Button
                    onClick={() =>
                      setSearchFilters({
                        destination: "",
                        checkIn: undefined,
                        checkOut: undefined,
                        guests: { adults: 0, children: 0, babies: 0 },
                        flexibility: 0,
                      })
                    }
                    className="bg-slate-400 hover:bg-slate-800 text-white rounded-lg h-10 px-3 md:hidden"
                    size="sm"
                  >
                    Effacer tout
                  </Button>

                  {/* Rechercher */}
                  <Button
                    onClick={handleSearch}
                    className="
    bg-slate-400 hover:bg-slate-800 text-white
    flex items-center justify-center gap-2
    h-10 px-3 rounded-lg
    md:h-12 md:w-12 md:rounded-full
  "
                    size="sm"
                  >
                    {/* Mobile: text + icon */}
                    <span className="text-sm font-medium flex items-center gap-2 md:hidden">
                      <Search className="h-4 w-4" />
                      Rechercher
                    </span>

                    {/* Desktop: icon only */}
                    <Search className="h-5 w-5 hidden md:block" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Date Selection Modal */}
      <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
        <DialogContent className="max-w-4xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50">
              {dateModalType === "checkin"
                ? "Sélectionner la date d'arrivée"
                : "Sélectionner la date de départ"}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="dates" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger
                value="dates"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
              >
                Dates
              </TabsTrigger>
              <TabsTrigger
                value="months"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
              >
                Mois
              </TabsTrigger>
              <TabsTrigger
                value="flexible"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
              >
                Flexible
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dates" className="mt-6">
              {/* Toggle which date we are setting */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button
                  size="sm"
                  variant={dateModalType === "checkin" ? "default" : "outline"}
                  onClick={() => setDateModalType("checkin")}
                  className="rounded-full"
                >
                  Arrivée — Quand ?
                </Button>
                <Button
                  size="sm"
                  variant={dateModalType === "checkout" ? "default" : "outline"}
                  onClick={() => setDateModalType("checkout")}
                  className="rounded-full"
                >
                  Départ — Quand ?
                </Button>
              </div>

              {/* Selected summary */}
              <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
                {searchFilters.checkIn
                  ? `Arrivée: ${format(searchFilters.checkIn, "d MMM yyyy", {
                      locale: fr,
                    })}`
                  : "Arrivée: —"}{" "}
                •{" "}
                {searchFilters.checkOut
                  ? `Départ: ${format(searchFilters.checkOut, "d MMM yyyy", {
                      locale: fr,
                    })}`
                  : "Départ: —"}
              </div>

              {/* Mobile: ONE calendar */}
              <div className="block md:hidden">
                <CalendarComponent
                  mode="single"
                  selected={
                    dateModalType === "checkin"
                      ? searchFilters.checkIn
                      : searchFilters.checkOut
                  }
                  onSelect={handleDateSelect}
                  locale={fr}
                  className="rounded-md border border-slate-200 dark:border-slate-800 w-full"
                />
              </div>

              {/* Desktop: TWO calendars side-by-side (unchanged behavior) */}
              <div className="hidden md:grid md:grid-cols-2 gap-6">
                <CalendarComponent
                  mode="single"
                  selected={
                    dateModalType === "checkin"
                      ? searchFilters.checkIn
                      : searchFilters.checkOut
                  }
                  onSelect={handleDateSelect}
                  locale={fr}
                  className="rounded-md border border-slate-200 dark:border-slate-800"
                />
                <CalendarComponent
                  mode="single"
                  selected={
                    dateModalType === "checkin"
                      ? searchFilters.checkIn
                      : searchFilters.checkOut
                  }
                  onSelect={handleDateSelect}
                  locale={fr}
                  month={addDays(new Date(), 30)}
                  className="rounded-md border border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Action row */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSearchFilters((p) => ({
                      ...p,
                      checkIn: undefined,
                      checkOut: undefined,
                    }))
                  }
                >
                  Effacer les dates
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => setDateModalOpen(false)}
                >
                  Valider
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="months" className="mt-6">
              <div className="space-y-6 max-w-md mx-auto">
                <p className="text-center text-slate-700 dark:text-slate-300 font-medium">
                  Quand ?
                </p>

                {/* Dial */}
                <MonthDial value={monthsAhead} />

                {/* Slider control */}
                <div className="px-2">
                  <Slider
                    value={[monthsAhead]}
                    onValueChange={(v) => setMonthsAhead(v[0])}
                    min={1}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>1</span>
                    <span>12</span>
                  </div>
                </div>

                {/* Calculated range preview */}
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {format(new Date(), "d MMM yyyy", { locale: fr })}{" "}
                    <span className="mx-1">au</span>{" "}
                    {format(addMonths(new Date(), monthsAhead), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>

                {/* Apply button (optional) */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setDateModalOpen(false);
                    }}
                    className="rounded-full"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flexible" className="mt-6">
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Flexibilité des dates :
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {flexibilityOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        searchFilters.flexibility === option.value
                          ? "default"
                          : "outline"
                      }
                      className="justify-start"
                      onClick={() =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          flexibility: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Search Results */}
      {showResults && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              Plus de {filteredProperties.length} logements
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Cards */}
            <div className="space-y-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className={cn(
                    "transition-all duration-200",
                    hoveredProperty === property.id ? "scale-105 shadow-lg" : ""
                  )}
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="sticky top-4">
              <MapView
                properties={filteredProperties}
                onPropertyHover={setHoveredProperty}
              />
            </div>
          </div>
        </section>
      )}

      {/* Property Sections */}
      {!showResults && (
        <section className="container mx-auto px-4 py-16">
          <PropertyCarousel
            title="Logement populaire à Bizerte"
            properties={mockProperties.filter((p) => p.location === "Bizerte")}
          />
          <PropertyCarousel
            title="Logement disponible ce weekend"
            properties={mockProperties.slice(0, 4)}
          />

          {cities.map((city) => (
            <PropertyCarousel
              key={city}
              title={`Logement à ${city}`}
              properties={mockProperties.filter((p) => p.location === city)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
