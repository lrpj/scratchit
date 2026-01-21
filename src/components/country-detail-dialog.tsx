import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Image, MapPin, Trash2, Upload } from 'lucide-react';


export interface TravelLog {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface CountryData {
  code: string;
  name: string;
  photos: string[];
  logs: TravelLog[];
  visited: boolean;
  wishlist: boolean;
}

interface CountryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: CountryData | null;
  onSave: (data: Partial<CountryData>) => void;
}

export function CountryDetailDialog({
  open,
  onOpenChange,
  country,
  onSave,
}: CountryDetailDialogProps) {
  const [photos, setPhotos] = useState<string[]>(country?.photos || []);
  const [logs, setLogs] = useState<TravelLog[]>(country?.logs || []);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogDescription, setNewLogDescription] = useState('');

  if (!country) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLog = () => {
    if (newLogTitle && newLogDate) {
      const newLog: TravelLog = {
        id: Date.now().toString(),
        title: newLogTitle,
        date: newLogDate,
        description: newLogDescription,
      };
      setLogs((prev) => [...prev, newLog]);
      setNewLogTitle('');
      setNewLogDate('');
      setNewLogDescription('');
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleSave = () => {
    onSave({
      photos,
      logs,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {country.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="logs">Travel Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            <div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload photos</p>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </Label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {photos.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No photos yet. Upload some memories!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <Label htmlFor="log-title">Title</Label>
                <Input
                  id="log-title"
                  placeholder="Trip to Paris"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={newLogDate}
                  onChange={(e) => setNewLogDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="log-description">Description</Label>
                <Textarea
                  id="log-description"
                  placeholder="Tell us about your experience..."
                  value={newLogDescription}
                  onChange={(e) => setNewLogDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleAddLog} className="w-full">
                Add Log
              </Button>
            </div>

            {logs.length > 0 && (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{log.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLog(log.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    {log.description && (
                      <p className="text-sm text-gray-700">{log.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {logs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No travel logs yet. Start documenting your journey!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
