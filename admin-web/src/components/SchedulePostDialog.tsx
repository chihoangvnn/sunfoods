import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SchedulePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedFanpages: Array<{
    id: string;
    name: string;
    platform: string;
    score: number;
  }>;
  content: {
    caption: string;
    hashtags: string[];
    assetIds: string[];
  };
  onSchedule: (schedules: Array<{
    socialAccountId: string;
    platform: string;
    scheduledTime: Date;
    timezone: string;
  }>) => Promise<void>;
}

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)', offset: 7 },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)', offset: 7 },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Trung Quốc (GMT+8)', offset: 8 },
  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)', offset: 7 },
  { value: 'UTC', label: 'UTC (GMT+0)', offset: 0 },
];

// Helper: Convert local datetime in a timezone to UTC (DST-free zones only)
function toUTC(year: number, month: number, day: number, hours: number, minutes: number, timezone: string, offset: number): Date {
  // Create UTC time by subtracting the offset
  // If timezone is GMT+7 (offset = 7), we interpret input as "7 hours ahead of UTC"
  // So to get UTC, subtract 7 hours
  return new Date(Date.UTC(year, month - 1, day, hours - offset, minutes, 0));
}

export function SchedulePostDialog({
  open,
  onOpenChange,
  matchedFanpages,
  content,
  onSchedule,
}: SchedulePostDialogProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Asia/Ho_Chi_Minh');
  const [selectedFanpages, setSelectedFanpages] = useState<string[]>(
    matchedFanpages.slice(0, 5).map(f => f.id)
  );
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || selectedFanpages.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Get timezone info
      const tz = TIMEZONES.find(t => t.value === selectedTimezone);
      if (!tz) {
        toast({
          title: "Lỗi timezone",
          description: "Timezone không hợp lệ",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Convert to UTC
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      const utcDate = toUTC(year, month, day, hours, minutes, selectedTimezone, tz.offset);
      
      // Validate: scheduled time must be in the future
      const now = new Date();
      if (utcDate <= now) {
        toast({
          title: "Thời gian không hợp lệ",
          description: "Không thể lên lịch cho thời điểm trong quá khứ. Vui lòng chọn thời gian trong tương lai.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const schedules = matchedFanpages
        .filter(fp => selectedFanpages.includes(fp.id))
        .map(fp => ({
          socialAccountId: fp.id,
          platform: fp.platform as 'facebook' | 'instagram' | 'twitter' | 'tiktok',
          scheduledTime: utcDate,
          timezone: selectedTimezone,
        }));

      await onSchedule(schedules);
      onOpenChange(false);
    } catch (error) {
      console.error('Schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFanpage = (id: string) => {
    setSelectedFanpages(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedFanpages.length === matchedFanpages.length) {
      setSelectedFanpages([]);
    } else {
      setSelectedFanpages(matchedFanpages.map(f => f.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lên Lịch Đăng Bài</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Fanpage Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Chọn Fanpage ({selectedFanpages.length}/{matchedFanpages.length})</Label>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedFanpages.length === matchedFanpages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {matchedFanpages.map((fanpage) => (
                <label
                  key={fanpage.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFanpages.includes(fanpage.id)}
                    onChange={() => toggleFanpage(fanpage.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fanpage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fanpage.platform} • Score: {fanpage.score}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Ngày đăng
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Giờ đăng
                </Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Múi giờ
                </Label>
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDate && selectedTime && (
                <div className="p-3 rounded-md bg-muted">
                  <p className="text-sm font-medium">Thời gian đăng bài:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, 'dd/MM/yyyy')} lúc {selectedTime}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTimezone.split('/')[1].replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Xem trước nội dung</Label>
            <div className="p-4 rounded-md border bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">{content.caption}</p>
              {content.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {content.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-primary">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {content.assetIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {content.assetIds.length} media file(s)
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={loading || !selectedDate || !selectedTime || selectedFanpages.length === 0}
          >
            {loading ? 'Đang lên lịch...' : `Lên lịch cho ${selectedFanpages.length} fanpage`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
