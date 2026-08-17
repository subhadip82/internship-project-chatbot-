'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, MessageSquare, FileText, Sparkles, Activity } from 'lucide-react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  detail: string;
  glow: string;
}

function StatsCard({ icon, label, value, detail, glow }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xl backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${glow} blur-2xl pointer-events-none opacity-40`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {detail}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl border shadow-inner flex-shrink-0"
          style={{
            backgroundColor: 'var(--card-inner)',
            borderColor: 'var(--card-border)',
          }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface QuickStatsProps {
  documentCount: number;
  conversationCount: number;
  messageCount: number;
  isBackendConnected?: boolean;
}

export default function QuickStats({
  documentCount,
  conversationCount,
  messageCount,
  isBackendConnected = true,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        label="Documents"
        value={documentCount}
        detail="PDFs in Vector Store"
        glow="bg-blue-600"
      />
      <StatsCard
        icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
        label="Conversations"
        value={conversationCount}
        detail="Active Chat Threads"
        glow="bg-indigo-600"
      />
      <StatsCard
        icon={<Sparkles className="h-5 w-5 text-sky-500" />}
        label="Questions"
        value={messageCount}
        detail="RAG Answers Generated"
        glow="bg-sky-600"
      />
      <StatsCard
        icon={<Activity className="h-5 w-5 text-emerald-500" />}
        label="System Status"
        value={isBackendConnected ? "Connected" : "Connecting"}
        detail={isBackendConnected ? "ChromaDB + RAG Active" : "Verifying API health..."}
        glow="bg-emerald-600"
      />
    </div>
  );
}
