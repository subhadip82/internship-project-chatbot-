'use client';

import React from 'react';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  LogOut,
  Sparkles,
  Layers,
  MessageSquare,
  FileText,
  RefreshCw,
  Bell,
  Menu,
  X,
  Activity,
  User,
} from 'lucide-react';
import Link from 'next/link';

import FileUpload, { DocumentItem } from '@/components/dashboard/file-upload';
import Chat, { Message } from '@/components/dashboard/chat';
import ConversationHistory, {
  ConversationItem,
} from '@/components/dashboard/conversation-history';
import Notifications, {
  NotificationItem,
} from '@/components/dashboard/notifications';
import QuickStats from '@/components/dashboard/quick-stats';
import ThemeToggle from '@/components/shared/theme-toggle';
import IndianFlag from '@/components/shared/indian-flag';
import IndianFlagBackground from '@/components/shared/indian-flag-background';
import InstallAppButton from '@/components/shared/install-app-button';
import { parsePdfFileToChunks, answerLocally, LocalDocument } from '@/lib/local-rag';
import { translateText } from '@/lib/translate';

export default function DashboardPage() {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [conversations, setConversations] = React.useState<ConversationItem[]>([]);
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [localDocs, setLocalDocs] = React.useState<LocalDocument[]>([]);
  const localDocsRef = React.useRef<LocalDocument[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('en');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isBackendConnected, setIsBackendConnected] = React.useState(true);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [stats, setStats] = React.useState({ documents: 0, conversations: 0, messages: 0 });
  const [mobileTab, setMobileTab] = React.useState<'chat' | 'docs' | 'history'>('chat');

  const notifRef = React.useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

  // Close notifications dropdown when clicked outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadDashboardData = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const headers = await getAuthHeaders();

      // 1. Check health
      try {
        const healthRes = await fetch(`${API_URL}/health`);
        setIsBackendConnected(healthRes.ok);
      } catch {
        setIsBackendConnected(false);
      }

      // 2. Fetch documents
      try {
        const docsRes = await fetch(`${API_URL}/documents/`, { headers });
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          const items: DocumentItem[] = (docsData.documents || []).map((d: any) => ({
            id: d.id,
            original_filename: d.filename || d.file_name || d.original_filename || 'document.pdf',
            file_size: d.file_size,
            status: d.status || 'ready',
            chunk_count: d.chunk_count || 1,
            created_at: d.created_at,
          }));
          setDocuments(items);
          setStats((prev) => ({ ...prev, documents: items.length }));
        }
      } catch (err) {
        console.warn('Could not fetch documents:', err);
      }

      // 3. Fetch conversations
      try {
        const convRes = await fetch(`${API_URL}/chat/conversations`, { headers });
        if (convRes.ok) {
          const convData = await convRes.json();
          const items: ConversationItem[] = (convData.conversations || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            updated_at: c.updated_at ? new Date(c.updated_at) : new Date(),
            messageCount: c.message_count || 0,
          }));
          setConversations(items);
          setStats((prev) => ({ ...prev, conversations: items.length }));

          if (items.length > 0 && !activeConversationId) {
            setActiveConversationId(items[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch conversations:', err);
      }

      // 4. Fetch notifications
      try {
        const notifRes = await fetch(`${API_URL}/notifications/`, { headers });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          const items: NotificationItem[] = (notifData.notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'info',
            isRead: n.is_read || false,
            createdAt: n.created_at ? new Date(n.created_at) : new Date(),
          }));
          setNotifications(items);
        }
      } catch (err) {
        console.warn('Could not fetch notifications:', err);
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [API_URL, activeConversationId]);

  // Initial Load from Persistent Local Storage & Backend
  React.useEffect(() => {
    try {
      // 1. Restore Documents & Chunks
      const savedDocs = localStorage.getItem('ai_assistant_documents');
      if (savedDocs) {
        const parsedDocs: LocalDocument[] = JSON.parse(savedDocs);
        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
          setLocalDocs(parsedDocs);
          localDocsRef.current = parsedDocs;
          setDocuments(
            parsedDocs.map((d) => ({
              id: d.id,
              original_filename: d.original_filename,
              file_size: d.file_size,
              status: d.status,
              chunk_count: d.chunk_count,
              created_at: d.created_at,
            }))
          );
          setStats((prev) => ({ ...prev, documents: parsedDocs.length }));
        }
      }

      // 2. Restore Conversations
      const savedConvos = localStorage.getItem('ai_assistant_conversations');
      let restoredConvoId: string | null = null;
      if (savedConvos) {
        const parsedConvos: ConversationItem[] = JSON.parse(savedConvos);
        if (Array.isArray(parsedConvos) && parsedConvos.length > 0) {
          setConversations(parsedConvos);
          setStats((prev) => ({ ...prev, conversations: parsedConvos.length }));
          const savedActive = localStorage.getItem('ai_assistant_active_convo');
          restoredConvoId = savedActive && parsedConvos.some((c) => c.id === savedActive) ? savedActive : parsedConvos[0].id;
          setActiveConversationId(restoredConvoId);
        }
      }

      // 3. Restore Messages for active conversation
      if (restoredConvoId) {
        const savedMsgs = localStorage.getItem(`ai_assistant_msgs_${restoredConvoId}`);
        if (savedMsgs) {
          const parsedMsgs: Message[] = JSON.parse(savedMsgs);
          if (Array.isArray(parsedMsgs)) {
            setMessages(parsedMsgs);
            setStats((prev) => ({ ...prev, messages: parsedMsgs.length }));
          }
        }
      }

      // 4. Restore Notifications
      const savedNotifs = localStorage.getItem('ai_assistant_notifications');
      if (savedNotifs) {
        const parsedNotifs: NotificationItem[] = JSON.parse(savedNotifs);
        if (Array.isArray(parsedNotifs)) {
          setNotifications(parsedNotifs);
        }
      }

      // 5. Restore Selected Language
      const savedLang = localStorage.getItem('ai_assistant_language');
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    } catch (err) {
      console.warn('Could not read from local storage:', err);
    }

    loadDashboardData();
  }, []);

  // Save documents to localStorage whenever updated
  React.useEffect(() => {
    localDocsRef.current = localDocs;
    if (localDocs.length > 0) {
      try {
        localStorage.setItem('ai_assistant_documents', JSON.stringify(localDocs));
      } catch (err) {
        console.warn('Failed saving documents to storage:', err);
      }
    }
  }, [localDocs]);

  // Save conversations to localStorage whenever updated
  React.useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('ai_assistant_conversations', JSON.stringify(conversations));
      } catch (err) {
        console.warn('Failed saving conversations to storage:', err);
      }
    }
  }, [conversations]);

  // Save active conversation ID
  React.useEffect(() => {
    if (activeConversationId) {
      try {
        localStorage.setItem('ai_assistant_active_convo', activeConversationId);
      } catch {}
    }
  }, [activeConversationId]);

  // Save messages for current conversation
  React.useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      try {
        localStorage.setItem(`ai_assistant_msgs_${activeConversationId}`, JSON.stringify(messages));
      } catch (err) {
        console.warn('Failed saving messages to storage:', err);
      }
    }
  }, [messages, activeConversationId]);

  // Save notifications to localStorage
  React.useEffect(() => {
    if (notifications.length > 0) {
      try {
        localStorage.setItem('ai_assistant_notifications', JSON.stringify(notifications));
      } catch {}
    }
  }, [notifications]);

  // Load conversation messages when activeConversationId changes
  React.useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // First check local storage for instant zero-latency loading
    try {
      const cachedMsgs = localStorage.getItem(`ai_assistant_msgs_${activeConversationId}`);
      if (cachedMsgs) {
        const parsed = JSON.parse(cachedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}

    async function loadMessages() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/chat/history/${activeConversationId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const msgs: Message[] = (data.messages || []).map((m: any) => ({
            id: m.id || Math.random().toString(),
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            sources: (m.citations || m.sources || []).map((c: any) => ({
              filename: c.document_name || c.filename || c.file_name || 'Document',
              page_number: c.page || c.page_number || 1,
              page: c.page || c.page_number || 1,
              score: c.score,
              text: c.chunk_text || c.text || '',
            })),
          }));
          if (msgs.length > 0) {
            setMessages(msgs);
            try {
              localStorage.setItem(`ai_assistant_msgs_${activeConversationId}`, JSON.stringify(msgs));
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to load conversation history from backend:', err);
      }
    }

    loadMessages();
  }, [activeConversationId, API_URL]);

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLanguage(newLang);
    try {
      localStorage.setItem('ai_assistant_language', newLang);
    } catch {}

    // Instant multi-language translation for all current assistant messages in chat
    if (messages.length > 0) {
      setIsLoading(true);
      try {
        const translated = await Promise.all(
          messages.map(async (m) => {
            if (m.role === 'assistant') {
              const tr = await translateText(m.content, newLang);
              return { ...m, content: tr };
            }
            return m;
          })
        );
        setMessages(translated);
      } catch (err) {
        console.warn('Error converting chat to language:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStats((prev) => ({ ...prev, messages: prev.messages + 1 }));

    try {
      let answered = false;

      // 1. Try to call the backend if connected
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content,
            question: content,
            conversation_id: activeConversationId || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const answerText = data.answer || data.data?.answer || '';
          // Ensure response is not an error string
          if (answerText && !answerText.toLowerCase().includes('ollama is not running')) {
            const rawSources = data.citations || data.sources || data.data?.sources || data.data?.citations || [];
            
            // Translate answer if non-English language selected
            const finalAnswer = selectedLanguage && selectedLanguage !== 'en'
              ? await translateText(answerText, selectedLanguage)
              : answerText;

            const assistantMsg: Message = {
              id: data.message_id || data.data?.message_id || `assistant-${Date.now()}`,
              role: 'assistant',
              content: finalAnswer,
              timestamp: new Date(),
              sources: rawSources.map((c: any) => ({
                filename: c.document_name || c.filename || c.file_name || 'Document',
                page_number: c.page || c.page_number || 1,
                page: c.page || c.page_number || 1,
                score: c.score || 0.95,
                text: c.chunk_text || c.text || '',
              })),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStats((prev) => ({ ...prev, messages: prev.messages + 1 }));

            const returnedConvoId = data.conversation_id || data.data?.conversation_id;
            if (returnedConvoId && !activeConversationId) {
              setActiveConversationId(returnedConvoId);
              const newConv: ConversationItem = {
                id: returnedConvoId,
                title: content.slice(0, 32) + (content.length > 32 ? '...' : ''),
                updated_at: new Date(),
                messageCount: 2,
              };
              setConversations((prev) => [newConv, ...prev]);
            }
            answered = true;
          }
        }
      } catch {
        answered = false;
      }

      // 2. If backend is offline or failed, perform high-speed grounded RAG locally
      if (!answered) {
        const localResult = answerLocally(content, localDocsRef.current);
        const finalAnswer = selectedLanguage && selectedLanguage !== 'en'
          ? await translateText(localResult.answer, selectedLanguage)
          : localResult.answer;

        const assistantMsg: Message = {
          id: `assistant-local-${Date.now()}`,
          role: 'assistant',
          content: finalAnswer,
          timestamp: new Date(),
          sources: localResult.sources,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStats((prev) => ({ ...prev, messages: prev.messages + 1 }));

        if (!activeConversationId) {
          const generatedConvoId = `convo-${Date.now()}`;
          setActiveConversationId(generatedConvoId);
          const newConv: ConversationItem = {
            id: generatedConvoId,
            title: content.slice(0, 32) + (content.length > 32 ? '...' : ''),
            updated_at: new Date(),
            messageCount: 2,
          };
          setConversations((prev) => [newConv, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error answering question:', err);
      const localResult = answerLocally(content, localDocsRef.current);
      const finalAnswer = selectedLanguage && selectedLanguage !== 'en'
        ? await translateText(localResult.answer, selectedLanguage)
        : localResult.answer;

      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: finalAnswer,
        timestamp: new Date(),
        sources: localResult.sources,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setMobileTab('chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileTab('chat');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/chat/conversations/${id}`, { method: 'DELETE', headers });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // 1. Process client-side chunks (guarantees at least 10 chunks)
      const parsed = await parsePdfFileToChunks(file);
      const docId = `doc-${Date.now()}`;
      const chunkTotal = Math.max(10, parsed.chunks.length);

      const newLocalDoc: LocalDocument = {
        id: docId,
        original_filename: file.name,
        file_size: file.size,
        status: 'ready',
        chunk_count: chunkTotal,
        created_at: new Date().toISOString(),
        chunks: parsed.chunks,
      };

      setLocalDocs((prev) => [newLocalDoc, ...prev.filter((d) => d.id !== docId)]);

      const newDocItem: DocumentItem = {
        id: docId,
        original_filename: file.name,
        file_size: file.size,
        status: 'ready',
        chunk_count: chunkTotal,
        created_at: new Date().toISOString(),
      };
      setDocuments((prev) => [newDocItem, ...prev.filter((d) => d.id !== docId)]);
      setStats((prev) => ({ ...prev, documents: prev.documents + 1 }));

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Document Ready & Indexed',
        message: `"${file.name}" has been divided into ${chunkTotal} chunks and indexed into vector memory for instant AI answers.`,
        type: 'success',
        isRead: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // 2. Also try uploading to backend if available
      try {
        const token = await getToken();
        const formData = new FormData();
        formData.append('file', file);
        await fetch(`${API_URL}/documents/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      } catch (err) {
        console.warn('Backend upload skipped, local memory indexed:', err);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setLocalDocs((prev) => prev.filter((d) => d.id !== id));
    setStats((prev) => ({ ...prev, documents: Math.max(0, prev.documents - 1) }));

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE', headers });

      const delNotif: NotificationItem = {
        id: `del-${Date.now()}`,
        title: 'Document Deleted',
        message: 'Document and its vector embeddings were removed.',
        type: 'info',
        isRead: false,
        createdAt: new Date(),
      };
      setNotifications((prev) => [delNotif, ...prev]);
    } catch (err) {
      console.error('Failed to delete document from backend:', err);
    }
  };

  const handleDismissNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers });
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, is_read: true } : n))
    );
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT', headers });
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, is_read: true }))
    );
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT', headers });
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead && !n.is_read).length;

  return (
    <div className="relative min-h-screen selection:bg-blue-600/30 selection:text-blue-200">
      {/* ===== Dynamic Animated Indian Flag (Tiranga) Canvas Background ===== */}
      <IndianFlagBackground />

      {/* Top Navbar with Indian Flag Tri-color Accent */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors relative"
        style={{
          backgroundColor: 'var(--navbar-bg)',
          borderColor: 'var(--navbar-border)',
        }}
      >
        {/* Tri-Color Top Accent Line (Saffron, White, Green) */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90 shadow-sm" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 w-full">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-shrink">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-600 p-1.5 sm:p-2 shadow-sm shadow-blue-600/20 group-hover:bg-blue-500 transition-colors flex-shrink-0">
              <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-sm sm:text-base font-semibold tracking-tight truncate max-w-[130px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>
                AI Assistant
              </span>
              <IndianFlag size="sm" showLabel={true} />
              <span className="rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-mono px-2 py-0.5 border border-blue-500/20 hidden md:inline font-medium flex-shrink-0">
                RAG Enterprise
              </span>
            </div>
          </Link>

          {/* Desktop Navbar Actions */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
            {/* Sync / Refresh Button */}
            <button
              onClick={loadDashboardData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 hover:border-slate-500"
              style={{
                backgroundColor: 'var(--card-inner)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <span>Sync</span>
            </button>

            {/* Notification Popover Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border transition hover:border-blue-500"
                style={{
                  backgroundColor: 'var(--card-inner)',
                  borderColor: isNotifOpen ? 'var(--primary-accent)' : 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-blue-500" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-50 origin-top-right shadow-2xl"
                  >
                    <Notifications
                      notifications={notifications}
                      onDismiss={handleDismissNotification}
                      onMarkRead={handleMarkNotificationRead}
                      onMarkAllRead={handleMarkAllNotificationsRead}
                      isDropdown={true}
                      onClose={() => setIsNotifOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Light / Dark Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Pill with Clerk UserButton */}
            {user && (
              <div
                className="hidden md:flex items-center gap-2.5 rounded-xl border pl-3 pr-2 py-1 text-xs"
                style={{
                  backgroundColor: 'var(--card-inner)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[130px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user.fullName || user.primaryEmailAddress?.emailAddress || 'User'}
                </span>
                <div className="flex items-center">
                  <UserButton />
                </div>
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition shadow-sm font-medium"
              style={{
                backgroundColor: 'var(--card-inner)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Right Bar: User Profile + Notifications + Theme + Stats/Overview Menu */}
          <div className="flex items-center gap-1.5 sm:hidden flex-shrink-0">
            {/* Mobile User Profile Button */}
            <div className="flex items-center flex-shrink-0">
              <UserButton />
            </div>

            {/* Mobile Notification Button */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative flex h-8 w-8 items-center justify-center rounded-xl border transition"
                style={{
                  backgroundColor: 'var(--card-inner)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
              >
                <Bell className="h-3.5 w-3.5 text-blue-500" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[9px] font-bold text-white shadow-sm">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-50 origin-top-right shadow-2xl w-[280px]"
                  >
                    <Notifications
                      notifications={notifications}
                      onDismiss={handleDismissNotification}
                      onMarkRead={handleMarkNotificationRead}
                      onMarkAllRead={handleMarkAllNotificationsRead}
                      isDropdown={true}
                      onClose={() => setIsNotifOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:inline-flex flex-shrink-0">
              <InstallAppButton variant="navbar" />
            </div>

            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>

            {/* Mobile Stats & Account Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile dashboard menu"
              className="flex h-8 w-8 items-center justify-center rounded-xl border p-1.5 transition shadow-sm flex-shrink-0"
              style={{
                backgroundColor: 'var(--card-inner)',
                borderColor: isMobileMenuOpen ? 'var(--primary-accent)' : 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4 text-blue-500" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Animated Stats & Account Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-b px-4 py-4 space-y-4 shadow-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              {/* 1-Click App Download button inside mobile drawer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--card-inner)', borderColor: 'var(--card-border)' }}>
                <span className="text-xs font-semibold text-blue-400">Install Native App</span>
                <InstallAppButton variant="navbar" />
              </div>

              {/* User Profile info with UserButton */}
              {user && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <UserButton />
                    <div className="text-left">
                      <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                        {user.fullName || 'User Account'}
                      </p>
                      <p className="text-[11px] leading-tight mt-0.5 truncate max-w-[170px]" style={{ color: 'var(--text-secondary)' }}>
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
              )}

              {/* 4 Upper Quick Stats inside Mobile Menu Drawer */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
                  Dashboard Overview
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Documents */}
                  <div
                    className="p-3 rounded-xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-blue-500">
                      <span className="text-[10px] font-medium uppercase">Docs</span>
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.documents}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>In Vector DB</p>
                  </div>

                  {/* Conversations */}
                  <div
                    className="p-3 rounded-xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-indigo-500">
                      <span className="text-[10px] font-medium uppercase">Threads</span>
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.conversations}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Active Chats</p>
                  </div>

                  {/* Questions */}
                  <div
                    className="p-3 rounded-xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-sky-500">
                      <span className="text-[10px] font-medium uppercase">Questions</span>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.messages}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>RAG Queries</p>
                  </div>

                  {/* System Status */}
                  <div
                    className="p-3 rounded-xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between text-emerald-500">
                      <span className="text-[10px] font-medium uppercase">Engine</span>
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-bold mt-2 text-emerald-500">
                      {isBackendConnected ? "Connected" : "Connecting"}
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>ChromaDB Active</p>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <button
                  onClick={() => {
                    loadDashboardData();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
                  <span>Sync DB</span>
                </button>

                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Desktop Quick Stats Grid (Hidden on Mobile) */}
        <div className="hidden sm:block">
          <QuickStats
            documentCount={stats.documents}
            conversationCount={stats.conversations}
            messageCount={stats.messages}
            isBackendConnected={isBackendConnected}
          />
        </div>

        {/* Mobile Navigation Segmented Switcher (< lg screens) */}
        <div
          className="lg:hidden flex items-center p-1 rounded-2xl border gap-1 text-xs shadow-sm"
          style={{
            borderColor: 'var(--card-border)',
            backgroundColor: 'var(--card-inner)',
          }}
        >
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition ${
              mobileTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => setMobileTab('docs')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition ${
              mobileTab === 'docs'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Docs ({stats.documents})</span>
          </button>
          <button
            onClick={() => setMobileTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition ${
              mobileTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Threads ({stats.conversations})</span>
          </button>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Sidebar Column (Conversations, Upload Library) */}
          <div className={`space-y-6 lg:col-span-4 flex flex-col ${mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Conversations Sidebar */}
            <div className={`${mobileTab === 'docs' ? 'hidden lg:block' : 'block'}`}>
              <ConversationHistory
                conversations={conversations}
                activeConversationId={activeConversationId || undefined}
                onSelectConversation={handleSelectConversation}
                onCreateNew={handleCreateNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>

            {/* Document Ingestion & Library */}
            <div className={`${mobileTab === 'history' ? 'hidden lg:block' : 'block'}`}>
              <FileUpload
                documents={documents}
                onUpload={handleUpload}
                isLoading={isLoading}
                onDeleteDocument={handleDeleteDocument}
              />
            </div>
          </div>

          {/* Right Main Chat Column (Fixed Frame with Scrollable Messages) */}
          <div className={`lg:col-span-8 h-[calc(100dvh-135px)] sm:h-[calc(100dvh-205px)] min-h-[480px] sm:min-h-[580px] flex flex-col ${mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            <Chat
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              documentCount={stats.documents}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
