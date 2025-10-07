import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface ScheduledPost {
  id: string;
  caption: string;
  hashtags: string[];
  assetIds: string[];
  platform: string;
  scheduledTime: string;
  timezone: string;
  priority: number;
  status: string;
}

interface EditScheduledPostDialogProps {
  post: ScheduledPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (GMT+7)", offset: 7 },
  { value: "Asia/Bangkok", label: "Bangkok (GMT+7)", offset: 7 },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)", offset: 8 },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)", offset: 9 },
  { value: "Asia/Shanghai", label: "Shanghai (GMT+8)", offset: 8 },
  { value: "Asia/Jakarta", label: "Jakarta (GMT+7)", offset: 7 },
  { value: "UTC", label: "UTC (GMT+0)", offset: 0 },
];

export default function EditScheduledPostDialog({
  post,
  open,
  onOpenChange,
}: EditScheduledPostDialogProps) {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Ho_Chi_Minh");
  const [priority, setPriority] = useState(5);

  // Initialize form when post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption);
      setHashtags(post.hashtags.join(" "));
      
      // Convert UTC to post's timezone for display
      const utcDate = parseISO(post.scheduledTime);
      const postTimezone = post.timezone || "Asia/Ho_Chi_Minh";
      const tz = TIMEZONES.find((t) => t.value === postTimezone);
      const offset = tz?.offset || 0;
      
      // Add offset to get local time in post's timezone
      const localTimestamp = utcDate.getTime() + offset * 60 * 60 * 1000;
      const localDate = new Date(localTimestamp);
      
      // Extract date and time in UTC mode (browser-timezone-independent)
      const year = localDate.getUTCFullYear();
      const month = localDate.getUTCMonth();
      const date = localDate.getUTCDate();
      const hours = String(localDate.getUTCHours()).padStart(2, '0');
      const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
      
      // Create date in UTC mode for calendar (prevents date shift)
      const calendarDate = new Date(Date.UTC(year, month, date, 12, 0, 0));
      
      setSelectedDate(calendarDate);
      setSelectedTime(`${hours}:${minutes}`);
      setSelectedTimezone(postTimezone);
      setPriority(post.priority);
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch(`/api/scheduled-posts/${post?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch đăng bài",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật bài đăng",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày và giờ đăng bài",
        variant: "destructive",
      });
      return;
    }

    // Parse time
    const [hours, minutes] = selectedTime.split(":").map(Number);
    
    // Get timezone offset
    const tz = TIMEZONES.find((t) => t.value === selectedTimezone);
    const offset = tz?.offset || 0;

    // Extract date in UTC mode (calendar date is already UTC-based)
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const date = selectedDate.getUTCDate();

    // Convert to UTC by subtracting offset
    const utcDate = new Date(
      Date.UTC(year, month, date, hours - offset, minutes, 0)
    );

    // Validate future time
    if (utcDate <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian đăng bài phải sau thời điểm hiện tại",
        variant: "destructive",
      });
      return;
    }

    const hashtagArray = hashtags
      .split(/\s+/)
      .filter((tag) => tag.startsWith("#"))
      .map((tag) => tag);

    updateMutation.mutate({
      caption,
      hashtags: hashtagArray,
      scheduledTime: utcDate.toISOString(),
      timezone: selectedTimezone,
      priority,
    });
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch đăng bài</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Caption */}
          <div className="space-y-2">
            <Label>Nội dung</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung bài đăng..."
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#hashtag1 #hashtag2"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Ngày đăng</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label>Giờ đăng</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Múi giờ</Label>
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

          {/* Priority */}
          <div className="space-y-2">
            <Label>Độ ưu tiên</Label>
            <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    {p} - {p <= 3 ? "Thấp" : p <= 6 ? "Trung bình" : p <= 8 ? "Cao" : "Khẩn cấp"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
