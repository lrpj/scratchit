import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Plane, Trash2 } from 'lucide-react';
import { CountryData } from './country-detail-dialog';

interface WishlistPanelProps {
  wishlistCountries: CountryData[];
  upcomingTrips: Array<{
    id: string;
    country: string;
    date: string;
  }>;
  onRemoveFromWishlist: (code: string) => void;
  onCountryClick: (code: string) => void;
}

export function WishlistPanel({
  wishlistCountries,
  upcomingTrips,
  onRemoveFromWishlist,
  onCountryClick,
}: WishlistPanelProps) {
  return (
    <div className="space-y-6">
      {/* Upcoming Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Upcoming Trips
          </CardTitle>
          <CardDescription>Your scheduled adventures</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTrips.length > 0 ? (
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{trip.country}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(trip.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Planned</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming trips planned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Travel Wishlist
          </CardTitle>
          <CardDescription>Places you want to visit</CardDescription>
        </CardHeader>
        <CardContent>
          {wishlistCountries.length > 0 ? (
            <div className="space-y-2">
              {wishlistCountries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <button
                    onClick={() => onCountryClick(country.code)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{country.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromWishlist(country.code)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No destinations in your wishlist yet</p>
              <p className="text-sm mt-1">Click on a country to add it!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
