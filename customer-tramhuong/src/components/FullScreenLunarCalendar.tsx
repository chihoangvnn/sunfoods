'use client';

import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback, memo } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { LunarDay, LunarMonthData, fetchLunarMonth } from '@/lib/lunarApi';
import { LunarCalendar } from './LunarCalendar';
import { useAuth } from '@/hooks/useAuth';
// Dialog will be inline modal - removed import

// Note interface and API functions
interface Note {
  id: string;
  userId: string;
  date: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_API_URL = '/api/notes';

// Vietnamese day and month names
const vietnameseDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayNames = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];
const vietnameseMonths = [
  'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'
];
const monthNames = [
  'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
  'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Category mapping for display
const categoryInfo = {
  customer_appointments: { color: 'bg-blue-500', label: 'Hẹn khách', emoji: '🛒' },
  orders: { color: 'bg-green-500', label: 'Đơn hàng', emoji: '📦' },
  business_plans: { color: 'bg-purple-500', label: 'Kế hoạch', emoji: '💰' },
  reminders: { color: 'bg-yellow-500', label: 'Nhắc nhở', emoji: '🎯' },
  meetings: { color: 'bg-red-500', label: 'Họp', emoji: '📞' }
};

// Custom hook for lunar data
function useLunarData(year: number, month: number) {
  const [data, setData] = useState<LunarMonthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLunarMonth(year, month + 1); // API expects 1-based month
      setData(result);
    } catch (err) {
      console.error('Error in useLunarData:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// API functions - Updated to use auth session
const fetchNotes = async (): Promise<Note[]> => {
  const response = await fetch(NOTES_API_URL);
  if (!response.ok) {
    if (response.status === 401) {
      // User not authenticated - return empty array
      return [];
    }
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
  const response = await fetch(NOTES_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
};

const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  const response = await fetch(`${NOTES_API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
};

const deleteNote = async (id: string): Promise<void> => {
  const response = await fetch(`${NOTES_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete note');
};

interface FullScreenLunarCalendarProps {
  className?: string;
  onBack?: () => void;
}

interface SelectedDayDetail {
  day: LunarDay;
  solarDayNumber: number;
}

export const FullScreenLunarCalendar = forwardRef<any, FullScreenLunarCalendarProps>(({ 
  className = '',
  onBack 
}, ref) => {
  const { user, isAuthenticated } = useAuth();
  const [showQuickView, setShowQuickView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<SelectedDayDetail | null>(null);

  // Notes state
  const [monthNotes, setMonthNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Use optimized hook for lunar data
  const { data: lunarData, loading, error, refetch } = useLunarData(currentYear, currentMonth);
  
  // Load notes for current month - Updated for auth
  useEffect(() => {
    const loadNotes = async () => {
      if (!isAuthenticated) {
        // User not logged in - clear notes
        setMonthNotes([]);
        setNotesLoading(false);
        return;
      }
      
      setNotesLoading(true);
      try {
        const notes = await fetchNotes();
        const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        const monthlyNotes = notes.filter(note => note.date.startsWith(currentMonthStr));
        setMonthNotes(monthlyNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
        setMonthNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, [currentMonth, currentYear, isAuthenticated]);

  // Get notes for a specific date
  const getNotesForDate = (dateStr: string): Note[] => {
    return monthNotes.filter(note => note.date === dateStr);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    navigateToDate: (date: Date) => {
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
      setSelectedDate(date);
    }
  }));

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Navigation for selected date - NEW from old version
  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
    
    // If navigated to different month, update month view
    if (newDate.getMonth() !== currentMonth || newDate.getFullYear() !== currentYear) {
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
    }
  }, [selectedDate, currentMonth, currentYear]);

  // Handle day click for modal
  const handleDayClick = useCallback((day: LunarDay) => {
    const solarDayNumber = parseInt(day.solarDate.split('-')[2]);
    setSelectedDay({ day, solarDayNumber });
  }, []);

  // Get selected date information (instead of just today)
  const todayInfo = useMemo(() => {
    if (!lunarData) return null;
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return lunarData.days.find(day => day.solarDate === selectedDateStr);
  }, [lunarData, selectedDate]);

  const daysInMonth = useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isToday = today.toDateString() === date.toDateString();
      const isSelected = selectedDate.toDateString() === date.toDateString();
      
      // Get lunar day information from API data
      let lunarDayData: LunarDay | null = null;
      if (lunarData && lunarData.days) {
        lunarDayData = lunarData.days.find(d => d.solarDate === dateStr) || null;
      }

      days.push({
        day,
        date,
        dateStr,
        isToday,
        isSelected,
        lunarDay: lunarDayData,
        notes: getNotesForDate(dateStr)
      });
    }
    
    return days;
  }, [lunarData, currentMonth, currentYear, selectedDate, monthNotes]);

  if (error) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Button onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-gray-50 ${className}`}>
      {/* Header xanh lá theo mẫu - Thu nhỏ để nổi bật phần ngày tháng */}
      <div className="bg-green-600 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-green-700 mr-2 p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-sm font-semibold">LỊCH VẠN NIÊN</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickView(true)}
            className="text-green-600 border-white bg-white hover:bg-gray-100 text-xs px-2 py-1"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Xem nhanh
          </Button>
        </div>
      </div>

      {/* Hiển thị ngày hôm nay theo mẫu - NGÀY ÂM DƯƠNG LỚN */}
      {todayInfo && (
        <div className="bg-white px-4 py-6 border-b">
          <div className="flex items-center justify-between">
            {/* Navigation Button Left */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDay('prev')}
              className="text-gray-600 hover:bg-gray-100 p-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="flex-1 flex items-center justify-between mx-4">
              {/* Dương lịch - LOẠN */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Dương lịch</div>
                <div className="text-7xl font-bold text-green-600">{selectedDate.getDate()}</div>
                <div className="text-sm text-gray-700 mt-1">
                  {monthNames[selectedDate.getMonth()]} năm {selectedDate.getFullYear()}
                </div>
              </div>

              {/* Âm lịch - LOẠN */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Âm lịch</div>
                <div className="text-7xl font-bold text-green-800">{todayInfo?.lunarDate || '-'}</div>
                <div className="text-sm text-red-600 mt-1">
                  {todayInfo?.holidayName || `Tháng ${todayInfo?.lunarMonth || '-'} Âm`}
                </div>
              </div>
            </div>

            {/* Navigation Button Right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDay('next')}
              className="text-gray-600 hover:bg-gray-100 p-2"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Thông tin chi tiết */}
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="font-medium">Mệnh ngày:</span> {todayInfo.canChi}</div>
            <div><span className="font-medium">Giờ hoàng đạo:</span> Dần (3h-5h), Thìn (7h-9h), Tỵ (9h-11h), Thân (15h-17h), Dậu (17h-19h), Hợi (21h-23h)</div>
            <div><span className="font-medium">Tuổi xung:</span> Canh thìn, Bính thìn</div>
          </div>
        </div>
      )}

      {/* Navigation tháng theo mẫu bản cũ */}
      <div className="bg-green-600 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-white hover:bg-green-700 p-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="bg-white text-green-600 px-2 py-1 rounded text-sm font-medium"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-white text-green-600 px-2 py-1 rounded text-sm font-medium"
            >
              {Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-green-600 border-white hover:bg-gray-100 text-xs px-2 py-1"
            >
              XEM
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="text-white hover:bg-green-700 p-1"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b">
          {vietnameseDays.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {daysInMonth.map((day, index) => {
            const isGoodDay = day?.lunarDay?.dayQuality === 'good';
            
            return (
              <div
                key={index}
                className={`border-b border-r last:border-r-0 h-24 relative ${
                  day ? 'cursor-pointer hover:bg-gray-50' : ''
                } ${
                  day?.isToday ? 'bg-green-50 border-green-300 border-2' : ''
                }`}
                onClick={() => {
                  if (day) {
                    setSelectedDate(day.date);
                  }
                }}
              >
                {day && (
                  <>
                    <div className="p-1 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-lg font-semibold ${
                          day.isToday 
                            ? 'text-white bg-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md'
                            : day.isSelected
                            ? 'text-blue-600 font-bold'
                            : 'text-gray-900'
                        }`}>
                          {day.day}
                        </span>
                        {day.isToday && (
                          <div className="text-xs bg-green-600 text-white px-1 rounded font-bold">
                            HÔM NAY
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-1 font-medium">
                        {day.lunarDay?.lunarDate}/{day.lunarDay?.lunarMonth}
                      </div>
                      
                      <div className="flex-1 flex items-end">
                        <div className="flex space-x-1 flex-wrap">
                          {/* Lunar day quality indicators */}
                          {day.lunarDay?.dayQuality === 'good' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          {day.lunarDay?.dayQuality === 'bad' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          
                          {/* Notes indicators with hover preview */}
                          {(() => {
                            const dayNotes = getNotesForDate(day.dateStr);
                            const uniqueCategories = [...new Set(dayNotes.map(note => note.category))];
                            if (dayNotes.length === 0) return null;
                            
                            return (
                              <div 
                                className="relative flex space-x-1"
                                onMouseEnter={(e) => {
                                  setHoveredDay(day.dateStr);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setTooltipPosition({ x: rect.left, y: rect.top - 10 });
                                }}
                                onMouseLeave={() => setHoveredDay(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Toggle tooltip for mobile/touch devices
                                  if (hoveredDay === day.dateStr) {
                                    setHoveredDay(null);
                                  } else {
                                    setHoveredDay(day.dateStr);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltipPosition({ x: rect.left, y: rect.top - 10 });
                                  }
                                }}
                              >
                                {uniqueCategories.slice(0, 3).map((category) => {
                                  const info = categoryInfo[category as keyof typeof categoryInfo];
                                  const colorClass = info?.color || 'bg-gray-500';
                                  return (
                                    <div 
                                      key={category}
                                      className={`w-2 h-2 ${colorClass} rounded-full cursor-pointer`}
                                    />
                                  );
                                })}
                                
                                {/* "+more" indicator */}
                                {uniqueCategories.length > 3 && (
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes preview tooltip (hover + tap for mobile) */}
      {hoveredDay && (
        <>
          {/* Background overlay for mobile tap-to-close */}
          <div 
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setHoveredDay(null)}
          />
          <div 
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs"
            style={{ 
              left: `${Math.min(tooltipPosition.x, (typeof window !== 'undefined' ? window.innerWidth : 400) - 250)}px`, 
              top: `${Math.max(tooltipPosition.y - 100, 10)}px`,
            }}
          >
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-2">
                Ghi chú ngày {hoveredDay.split('-')[2]}/{hoveredDay.split('-')[1]}
              </div>
              {(() => {
                const dayNotes = getNotesForDate(hoveredDay);
                return dayNotes.slice(0, 3).map((note) => {
                  const info = categoryInfo[note.category as keyof typeof categoryInfo];
                  return (
                    <div key={note.id} className="flex items-start space-x-2 mb-1">
                      <span className="text-xs">{info?.emoji || '📝'}</span>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">{info?.label || note.category}</div>
                        <div className="text-xs text-gray-800 truncate">
                          {note.content.length > 30 ? note.content.substring(0, 30) + '...' : note.content}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
              {getNotesForDate(hoveredDay).length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{getNotesForDate(hoveredDay).length - 3} ghi chú khác
                </div>
              )}
              
              {/* Mobile-friendly close button */}
              <div className="md:hidden mt-2 pt-2 border-t border-gray-100">
                <button 
                  className="text-xs text-blue-600 w-full text-center"
                  onClick={() => setHoveredDay(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Chú thích */}
      <div className="bg-white border-t px-4 py-2">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          {/* Lunar day indicators */}
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Âm lịch:</div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Hoàng đạo</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>Hắc đạo</span>
            </div>
          </div>
          
          {/* Notes indicators */}
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Ghi chú:</div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span>Hẹn khách</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Đơn hàng</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span>Kế hoạch</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span>Nhắc nhở, Họp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected date section - simplified */}
      <div className="bg-white border-t px-4 py-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {vietnameseDays[selectedDate.getDay()]} {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
          </h3>
          <p className="text-sm text-gray-600">
            Ngày được chọn: {format(selectedDate, 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      {/* Quick view modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Xem nhanh theo ngày</h3>
              <Button
                variant="ghost"
                onClick={() => setShowQuickView(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Chọn ngày để xem thông tin chi tiết</p>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setCurrentMonth(date.getMonth());
                  setCurrentYear(date.getFullYear());
                  setSelectedDate(date);
                  setShowQuickView(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FullScreenLunarCalendar.displayName = 'FullScreenLunarCalendar';