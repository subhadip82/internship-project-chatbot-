'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Plus, Search, Sparkles } from 'lucide-react';

export interface ConversationItem {
  id: string;
  title: string;
  messageCount?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

interface ConversationHistoryProps {
  conversations: ConversationItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  onDeleteConversation: (id: string) => void;
}

export default function ConversationHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateNew,
  onDeleteConversation,
}: ConversationHistoryProps) {
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [conversations, search]);

  return (
    <div
      className="flex h-full flex-col rounded-2xl border p-4 shadow-2xl backdrop-blur-xl space-y-4"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Chat Threads
          </h3>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-mono border"
            style={{
              backgroundColor: 'var(--card-inner)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {conversations.length}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateNew}
          className="flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </motion.button>
      </div>

      {/* Search Bar */}
      {conversations.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads..."
            className="w-full rounded-xl border pl-8 pr-3 py-1.5 text-xs transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--card-inner)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[380px]">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center" style={{ color: 'var(--text-muted)' }}>
              <MessageSquare className="mb-2 h-7 w-7 opacity-30" />
              <p className="text-xs">
                {search ? 'No matching chats' : 'No saved conversations'}
              </p>
            </div>
          ) : (
            filtered.map((convo) => {
              const isActive = activeConversationId === convo.id;

              return (
                <motion.div
                  key={convo.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="group relative"
                >
                  <button
                    onClick={() => onSelectConversation(convo.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-all flex items-center justify-between gap-2 border ${
                      isActive
                        ? 'border-blue-500/50 bg-blue-500/10 shadow-sm'
                        : 'border-transparent hover:border-slate-700/50'
                    }`}
                    style={{
                      backgroundColor: isActive ? undefined : 'var(--card-inner)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          isActive ? 'bg-blue-500' : 'bg-slate-500'
                        }`}
                      />
                      <p className="truncate text-xs font-medium max-w-[140px] sm:max-w-[160px]">
                        {convo.title || 'Untitled Chat'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {convo.messageCount !== undefined && convo.messageCount > 0 && (
                        <span className="text-[10px] opacity-60 font-mono group-hover:opacity-0 transition-opacity">
                          {convo.messageCount}m
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(convo.id);
                    }}
                    className="absolute right-2 top-2.5 hidden rounded-lg p-1 text-slate-400 hover:bg-red-500/15 hover:text-red-400 group-hover:block transition"
                    title="Delete Conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
