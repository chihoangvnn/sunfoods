'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit3, Trash2, Calendar, Plus, BarChart3, FileText, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface Note {
  id: string;
  userId: string;
  date: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesManagementPageProps {
  onBack?: () => void;
  className?: string;
}

const NOTES_API_URL = '/api/notes';

// Category mapping
const categoryInfo = {
  customer_appointments: { color: 'bg-blue-500', label: 'Hẹn khách', emoji: '🛒', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
  orders: { color: 'bg-green-500', label: 'Đơn hàng', emoji: '📦', lightBg: 'bg-green-50', textColor: 'text-green-700' },
  business_plans: { color: 'bg-purple-500', label: 'Kế hoạch', emoji: '💰', lightBg: 'bg-purple-50', textColor: 'text-purple-700' },
  reminders: { color: 'bg-yellow-500', label: 'Nhắc nhở', emoji: '🎯', lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
  meetings: { color: 'bg-red-500', label: 'Họp', emoji: '📞', lightBg: 'bg-red-50', textColor: 'text-red-700' }
};

// API functions
const fetchNotes = async (): Promise<Note[]> => {
  const response = await fetch(NOTES_API_URL);
  if (!response.ok) throw new Error('Failed to fetch notes');
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

export function NotesManagementPage({ onBack, className = '' }: NotesManagementPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchNotes();
        setNotes(data);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [isAuthenticated, user?.id]);

  // Filtered and searched notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.date.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [notes, selectedCategory, searchTerm]);

  // Statistics
  const statistics = useMemo(() => {
    const total = notes.length;
    const byCategory = Object.keys(categoryInfo).reduce((acc, key) => {
      acc[key] = notes.filter(note => note.category === key).length;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = notes.filter(note => {
      const noteDate = new Date(note.date);
      const now = new Date();
      return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, byCategory, thisMonth };
  }, [notes]);

  // Handle edit note
  const handleEditNote = async (note: Note) => {
    if (editingNote && editingNote.id === note.id) {
      // Save edit
      try {
        const updatedNote = await updateNote(note.id, { 
          content: editContent, 
          category: note.category 
        });
        setNotes(notes.map(n => n.id === note.id ? updatedNote : n));
        setEditingNote(null);
        setEditContent('');
      } catch (error) {
        console.error('Error updating note:', error);
      }
    } else {
      // Start editing
      setEditingNote(note);
      setEditContent(note.content);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      try {
        await deleteNote(noteId);
        setNotes(notes.filter(n => n.id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải ghi chú...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem và quản lý ghi chú của bạn.</p>
          {onBack && (
            <Button onClick={onBack} className="bg-green-600 hover:bg-green-700 text-white">
              Quay lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="mr-2 p-1"
                >
                  ←
                </Button>
              )}
              <h1 className="text-xl font-bold text-gray-900">Quản lý Ghi chú</h1>
            </div>
            <FileText className="w-6 h-6 text-green-600" />
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category filters */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 -mx-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả ({notes.length})
            </button>
            {Object.entries(categoryInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center ${
                  selectedCategory === key
                    ? `${info.color} text-white`
                    : `${info.lightBg} ${info.textColor} hover:opacity-80`
                }`}
              >
                <span className="mr-1">{info.emoji}</span>
                {info.label} ({statistics.byCategory[key] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng ghi chú</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng này</p>
                <p className="text-2xl font-bold text-green-600">{statistics.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã lọc</p>
                <p className="text-2xl font-bold text-purple-600">{filteredNotes.length}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Không tìm thấy ghi chú nào phù hợp'
                  : 'Chưa có ghi chú nào'
                }
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const categoryData = categoryInfo[note.category as keyof typeof categoryInfo];
              const isEditing = editingNote?.id === note.id;

              return (
                <div key={note.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${categoryData?.color || 'bg-gray-500'} text-white`}>
                        <span className="mr-1">{categoryData?.emoji || '📝'}</span>
                        {categoryData?.label || note.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(note.date), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      {isEditing && (
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-800">{note.content}</p>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Cập nhật: {format(new Date(note.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}