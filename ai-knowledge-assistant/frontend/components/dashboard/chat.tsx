'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot,
  User,
  Terminal,
  ExternalLink,
  Info,
  Layers,
  Languages,
  Globe,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/translate';

export interface Source {
  filename: string;
  page_number?: number;
  page?: number;
  chunk_id?: string;
  score?: number;
  text?: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp?: Date | string;
  createdAt?: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  onClearChat?: () => void;
  documentCount?: number;
  selectedLanguage?: string;
  onLanguageChange?: (langCode: string) => void;
}

const STARTER_PROMPTS = [
  'Summarize the key findings in my documents',
  'What are the main takeaways and conclusions?',
  'List all key dates, names, or statistics mentioned',
  'Compare the different topics discussed in the files',
];

export default function Chat({
  messages,
  onSendMessage,
  isLoading = false,
  onClearChat,
  documentCount = 0,
  selectedLanguage = 'en',
  onLanguageChange,
}: ChatProps) {
  const [input, setInput] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [copiedOllamaCmd, setCopiedOllamaCmd] = React.useState(false);
  const [expandedSources, setExpandedSources] = React.useState<Record<string, boolean>>({});
  const [showOllamaHelp, setShowOllamaHelp] = React.useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);
  const langDropdownRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyOllamaCommand = () => {
    navigator.clipboard.writeText('ollama run llama3.2:1b');
    setCopiedOllamaCmd(true);
    setTimeout(() => setCopiedOllamaCmd(false), 2000);
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div
      className="flex h-full max-h-full flex-col rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {/* Chat Header */}
      <div
        className="shrink-0 flex items-center justify-between border-b px-5 py-3.5"
        style={{
          backgroundColor: 'var(--card-inner)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                Document Knowledge Assistant
              </h2>
              <span className="flex h-2 w-2 relative">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {documentCount > 0
                ? `Active knowledge: ${documentCount} PDF document${documentCount > 1 ? 's' : ''}`
                : 'Upload a PDF to ground responses'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ollama Guide Toggle */}
          <button
            onClick={() => setShowOllamaHelp((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-400 hover:bg-blue-500/20 transition font-medium"
            title="Local Ollama Guide"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ollama Info</span>
          </button>

          {messages.length > 0 && onClearChat && (
            <button
              onClick={onClearChat}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition disabled:opacity-50 hover:border-slate-500 font-medium"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--card-inner)',
                color: 'var(--text-secondary)',
              }}
              title="Clear Chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Ollama Offline Helper Banner */}
      <AnimatePresence>
        {showOllamaHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 border-b border-blue-500/20 bg-blue-950/25 p-3 sm:px-6 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-400">
                    Ollama Local Model Configuration:
                  </p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Start Ollama locally at <code className="text-blue-400 font-mono">http://localhost:11434</code> by running:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
                <code className="font-mono text-blue-400 text-[11px]">
                  ollama run llama3.2:1b
                </code>
                <button
                  onClick={copyOllamaCommand}
                  className="text-slate-400 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedOllamaCmd ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4 text-blue-500"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>

            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Ask Questions About Your Documents
            </h3>
            <p className="max-w-md text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Upload PDF reports or notes. The assistant retrieves exact passages and formulates factual, source-backed answers.
            </p>

            {/* Starter Suggestion Pills */}
            <div className="w-full max-w-lg space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-left mb-2" style={{ color: 'var(--text-muted)' }}>
                Suggested Queries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="flex items-center gap-2 rounded-xl border p-3 text-left text-xs transition group shadow-sm hover:border-blue-500/40"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const hasSources = message.sources && message.sources.length > 0;
                const isExpanded = expandedSources[message.id] ?? true;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold shadow-sm flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    {/* Message Card */}
                    <div
                      className={`relative group max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        isUser
                          ? 'text-white rounded-br-none'
                          : 'rounded-bl-none border'
                      }`}
                      style={{
                        background: isUser ? 'var(--user-bubble-bg)' : 'var(--bot-bubble-bg)',
                        borderColor: isUser ? 'transparent' : 'var(--bot-bubble-border)',
                        color: isUser ? 'var(--user-bubble-text)' : 'var(--text-primary)',
                      }}
                    >
                      {/* Message Content */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {/* 5 Source Citations Section */}
                      {hasSources && (
                        <div className="mt-4 pt-3 border-t border-slate-700/40">
                          <button
                            onClick={() => toggleSourceExpand(message.id)}
                            className="flex items-center justify-between w-full text-xs font-semibold text-blue-500 hover:text-blue-400 transition py-1"
                          >
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-bold">{message.sources!.length} Source Citations</span>
                              <span className="rounded bg-blue-500/10 text-blue-500 text-[10px] font-mono px-2 py-0.5 border border-blue-500/20">
                                Grounded
                              </span>
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 space-y-2.5"
                            >
                              {message.sources!.map((src, sidx) => {
                                const pageNum = src.page_number ?? src.page ?? 1;
                                const scorePct = src.score ? Math.round(src.score * 100) : 88;
                                const snippetText = src.text || src.snippet || '';

                                return (
                                  <div
                                    key={sidx}
                                    className="rounded-xl border p-3 text-xs space-y-1.5 shadow-sm transition hover:border-slate-600"
                                    style={{
                                      backgroundColor: 'var(--card-inner)',
                                      borderColor: 'var(--card-border)',
                                    }}
                                  >
                                    <div className="flex items-center justify-between font-medium">
                                      <span className="truncate max-w-[220px] sm:max-w-[320px] text-blue-500 font-semibold flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                        [{sidx + 1}] {src.filename}
                                      </span>
                                      <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                                        Page {pageNum}
                                      </span>
                                    </div>

                                    {snippetText && (
                                      <p
                                        className="text-[11px] italic leading-relaxed line-clamp-3 p-2 rounded-lg"
                                        style={{
                                          backgroundColor: 'var(--input-bg)',
                                          color: 'var(--text-secondary)',
                                        }}
                                      >
                                        &ldquo;{snippetText}&rdquo;
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                                        <div
                                          className="h-full bg-blue-600"
                                          style={{ width: `${Math.min(100, Math.max(15, scorePct))}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                                        {scorePct}% match
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Copy Action Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition rounded-md p-1.5 text-slate-400 hover:text-white"
                          style={{ backgroundColor: 'var(--card-inner)' }}
                          title="Copy Answer"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-700 text-white font-medium flex-shrink-0 mt-1 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Thinking / Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div
                  className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="font-medium">Searching ChromaDB vector store and retrieving citations...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form (Fixed Pinned at Bottom) */}
      <div
        className="shrink-0 border-t p-3 sm:p-4 sticky bottom-0 z-10 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--card-inner)',
          borderColor: 'var(--card-border)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isLoading
                  ? 'Searching documents...'
                  : selectedLanguage === 'bn'
                  ? 'আপনার ডকুমেন্ট সম্পর্কে প্রশ্ন জিজ্ঞাসা করুন...'
                  : selectedLanguage === 'hi'
                  ? 'अपने दस्तावेज़ के बारे में प्रश्न पूछें...'
                  : selectedLanguage === 'mr'
                  ? 'आपल्या दस्तऐवजाबद्दल प्रश्न विचारा...'
                  : selectedLanguage === 'or'
                  ? 'ଆପଣଙ୍କ ଡକ୍ୟୁମେଣ୍ଟ ବିଷୟରେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...'
                  : 'Ask a question about your uploaded documents...'
              }
              disabled={isLoading}
              className="w-full rounded-xl border px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Multi-Language Selector Dropdown Beside Send Button */}
          <div className="relative flex-shrink-0" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              className="flex h-10 sm:h-11 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold shadow-sm transition hover:border-blue-500"
              style={{
                backgroundColor: 'var(--card-inner)',
                borderColor: isLangDropdownOpen ? 'var(--primary-accent)' : 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
              title="Select Response Language (বাংলা, हिन्दी, English, etc.)"
            >
              <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="max-w-[65px] sm:max-w-[95px] truncate">
                {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.nativeName || 'English'}
              </span>
              <ChevronUp className={`h-3 w-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Popover Menu */}
            <AnimatePresence>
              {isLangDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl z-50 origin-bottom-right"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="px-2 py-1.5 border-b border-slate-700/40 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Answer Language
                    </span>
                    <span className="text-[10px] text-slate-400">11 Languages</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = lang.code === selectedLanguage;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            if (onLanguageChange) {
                              onLanguageChange(lang.code);
                            }
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm font-semibold'
                              : 'hover:bg-slate-800/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{lang.flag}</span>
                            <span className="truncate">{lang.nativeName}</span>
                            <span className="text-[10px] opacity-75 font-normal">({lang.name})</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
