import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Image as ImageIcon, BookOpen } from 'lucide-react';
import { CountryData } from './country-detail-dialog';


interface VisitedCountriesPanelProps {
  visitedCountries: CountryData[];
  onCountryClick: (code: string) => void;
}

export function VisitedCountriesPanel({
  visitedCountries,
  onCountryClick,
}: VisitedCountriesPanelProps) {
  const totalPhotos = visitedCountries.reduce((sum, c) => sum + c.photos.length, 0);
  const totalLogs = visitedCountries.reduce((sum, c) => sum + c.logs.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {visitedCountries.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Countries Visited</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalPhotos}</div>
              <div className="text-sm text-gray-600 mt-1">Photos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalLogs}</div>
              <div className="text-sm text-gray-600 mt-1">Travel Logs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Visited Countries
          </CardTitle>
          <CardDescription>Places you've been to</CardDescription>
        </CardHeader>
        <CardContent>
          {visitedCountries.length > 0 ? (
            <div className="space-y-4">
              {visitedCountries.map((country) => (
                <div
                  key={country.code}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onCountryClick(country.code)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {country.name}
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Visited
                        </Badge>
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {country.photos.length} photos
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {country.logs.length} logs
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>

                  {/* Photo preview */}
                  {country.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {country.photos.slice(0, 4).map((photo, index) => (
                        <ImageWithFallback
                          key={index}
                          src={photo}
                          alt={`${country.name} photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Recent log preview */}
                  {country.logs.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <div className="font-medium text-blue-900">
                        {country.logs[country.logs.length - 1].title}
                      </div>
                      <div className="text-blue-700 text-xs mt-1">
                        {new Date(country.logs[country.logs.length - 1].date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2">No countries visited yet</p>
              <p className="text-sm">Start exploring by clicking on the map!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
