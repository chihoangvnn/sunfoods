'use client';

import React from 'react';
import { NotesManagementPage } from '@/components/NotesManagementPage';
import { useRouter } from 'next/navigation';

export default function AccountNotesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <NotesManagementPage 
        onBack={() => router.back()}
        className=""
      />
    </div>
  );
}