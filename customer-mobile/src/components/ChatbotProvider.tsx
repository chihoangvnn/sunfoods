'use client';

import { ReactNode } from 'react';
import MobileChatBot from './MobileChatBot';
import DesktopChatBot from './DesktopChatBot';

export function ChatbotProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Render chatbot at top level - never remounts */}
      {/* Use CSS media queries to show/hide - no useState lag */}
      <div className="md:hidden">
        <MobileChatBot />
      </div>
      <div className="hidden md:block">
        <DesktopChatBot />
      </div>
    </>
  );
}
