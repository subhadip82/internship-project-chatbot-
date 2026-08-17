'use client';

import React, { useState } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Search,
  ShieldCheck,
  BookOpenText,
  Layers,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Sparkles,
  Zap,
  Cpu,
  Database,
  Terminal,
  User,
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/theme-toggle';
import InstallAppButton from '@/components/shared/install-app-button';
import CloudBackground from '@/components/shared/cloud-background';
import IndianFlag from '@/components/shared/indian-flag';

const features = [
  {
    icon: FileText,
    title: 'Enterprise PDF Ingestion',
    description:
      'Upload complex reports, technical documentation, and contracts into a secure, dedicated vector repository.',
    tag: 'PDF Engine',
  },
  {
    icon: BrainCircuit,
    title: 'Contextual RAG Pipeline',
    description:
      'Multi-stage semantic search retrieves precise chunk passages before generating grounded, verifiable answers.',
    tag: 'Retrieval RAG',
  },
  {
    icon: BookOpenText,
    title: 'Grounded Source Citations',
    description:
      'Every answer is paired with up to 5 verifiable source cards showing exact file names, page numbers, and match scores.',
    tag: '5 Citations',
  },
  {
    icon: Search,
    title: 'High-Precision Vector Search',
    description:
      'Embedded with all-MiniLM-L6-v2 and stored in ChromaDB for sub-second semantic retrieval.',
    tag: 'ChromaDB',
  },
  {
    icon: Layers,
    title: 'Multi-Thread History',
    description:
      'Organize questions and analytical findings across persistent, isolated conversation threads.',
    tag: 'Multi-Thread',
  },
  {
    icon: ShieldCheck,
    title: 'Account Isolation & Security',
    description:
      'Secure user-scoped authentication ensures your documents and queries remain strictly private.',
    tag: 'Clerk Auth',
  },
];

const pipeline = [
  { step: '01', title: 'Upload Document', desc: 'PDFs up to 20MB', icon: FileText },
  { step: '02', title: 'Text Extraction', desc: 'Page-level parsing', icon: Cpu },
  { step: '03', title: 'Chunk & Embed', desc: 'MiniLM-L6-v2 vectors', icon: Sparkles },
  { step: '04', title: 'ChromaDB Index', desc: 'Persistent store', icon: Database },
  { step: '05', title: 'Semantic Query', desc: 'Top-K cosine similarity', icon: Search },
  { step: '06', title: 'Grounded Answer', desc: '3-4 line concise synthesis', icon: BrainCircuit },
];

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen overflow-hidden selection:bg-blue-600/30 selection:text-blue-200 transition-colors"
      style={{
        color: 'var(--text-primary)',
      }}
    >
      {/* ===== 3D Atmospheric Volumetric Cloud & Sky Animated Engine ===== */}
      <CloudBackground />

      {/* ===== Ambient Floating Ambient Grid Layer ===== */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Moving Geometric Grid */}
        <div
          className="absolute inset-0 animate-grid-move opacity-35"
          style={{
            backgroundImage: `radial-gradient(var(--grid-color) 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Ambient Top Radiant Orb */}
        <div
          className="absolute -top-40 left-1/2 h-[550px] w-[750px] -translate-x-1/2 rounded-full blur-[140px] animate-float-slow opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 70%)',
          }}
        />

        {/* Ambient Floating Right Cyan/Indigo Orb */}
        <div
          className="absolute top-1/3 -right-28 h-[500px] w-[550px] rounded-full blur-[150px] animate-float-reverse opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(79, 70, 229, 0.2) 50%, transparent 70%)',
          }}
        />

        {/* Ambient Floating Left Purple/Sky Orb */}
        <div
          className="absolute bottom-1/4 -left-32 h-[450px] w-[500px] rounded-full blur-[140px] animate-pulse-glow opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(37, 99, 235, 0.2) 50%, transparent 70%)',
          }}
        />

        {/* Subtle Diagonal Scanlines for High-End SaaS Depth */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, var(--text-primary) 0, var(--text-primary) 1px, transparent 0, transparent 50%)`,
            backgroundSize: '12px 12px',
          }}
        />
      </div>

      {/* ===== Top Navbar with Indian Flag Tri-color Accent ===== */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors relative"
        style={{
          backgroundColor: 'var(--navbar-bg)',
          borderColor: 'var(--navbar-border)',
        }}
      >
        {/* Tri-Color Top Accent Line (Saffron, White, Green) */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90 shadow-sm" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 mr-2">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-600 p-1.5 sm:p-2 shadow-md shadow-blue-600/30 text-white transition-colors group-hover:bg-blue-500 shrink-0"
            >
              <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-base font-bold tracking-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>
                AI Knowledge Assistant
              </span>
              <div className="shrink-0 hidden xs:inline-flex">
                <IndianFlag size="sm" />
              </div>
              <span className="rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-mono px-2 py-0.5 border border-blue-500/20 hidden md:inline font-medium shrink-0">
                Enterprise RAG
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Animated Underline */}
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex shrink-0" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="transition hover:text-blue-500 hover:-translate-y-0.5">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-blue-500 hover:-translate-y-0.5">
              Architecture
            </a>
            <a href="#security" className="transition hover:text-blue-500 hover:-translate-y-0.5">
              Security
            </a>
          </nav>

          {/* Desktop Navbar Actions */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <InstallAppButton variant="navbar" />
            <ThemeToggle />

            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/20"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center pl-1">
                  <UserButton />
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-xl border px-4 py-2 text-xs sm:text-sm font-medium transition hover:border-blue-500 hover:text-blue-500"
                  style={{
                    backgroundColor: 'var(--card-inner)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/20"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Bar: Flag + User Profile + Theme Toggle + Menu Hamburger */}
          <div className="flex items-center gap-1.5 sm:hidden shrink-0">
            <div className="xs:hidden flex items-center">
              <IndianFlag size="sm" />
            </div>
            {isLoaded && isSignedIn && (
              <div className="flex items-center shrink-0">
                <UserButton />
              </div>
            )}
            <div className="shrink-0">
              <ThemeToggle />
            </div>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              className="flex h-8 w-8 items-center justify-center rounded-xl border p-1.5 transition hover:border-blue-500 shadow-sm shrink-0"
              style={{
                backgroundColor: 'var(--card-inner)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-blue-500" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Animated Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-b px-5 py-5 space-y-4 shadow-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div className="flex flex-col space-y-2.5 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition"
                >
                  Architecture
                </a>
                <a
                  href="#security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition"
                >
                  Security
                </a>
              </div>

              <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--card-border)' }}>
                <div className="w-full">
                  <InstallAppButton variant="navbar" />
                </div>

                {isLoaded && isSignedIn ? (
                  <div className="space-y-2.5">
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
                            {user?.fullName || 'User Account'}
                          </p>
                          <p className="text-[11px] leading-tight mt-0.5 truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-xl border py-2 text-xs font-medium transition hover:border-blue-500"
                      style={{
                        backgroundColor: 'var(--card-inner)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-sm"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ===== Hero Section ===== */}
        <section
          className="relative border-b py-20 lg:py-28 transition-colors"
          style={{
            borderColor: 'var(--card-border)',
          }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-500 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Enterprise RAG Platform</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]" style={{ color: 'var(--text-primary)' }}>
                  Turn Your Documents Into <span className="text-blue-500">Accurate Knowledge.</span>
                </h1>

                <p className="max-w-2xl text-base sm:text-lg leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
                  A high-performance retrieval-augmented generation platform that indexes your private PDF documents into ChromaDB and generates verified, concise, source-backed answers in real time.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  {isLoaded && isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-600/40"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-600/40"
                      >
                        <span>Get Started Free</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/sign-in"
                        className="rounded-xl border px-6 py-3.5 text-sm font-medium transition-all hover:border-blue-500 hover:text-blue-500 hover:-translate-y-0.5 shadow-sm"
                        style={{
                          backgroundColor: 'var(--card-inner)',
                          borderColor: 'var(--card-border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Sign In
                      </Link>
                    </>
                  )}

                  <InstallAppButton variant="hero" />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>5 Grounded Citations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>ChromaDB Vector Store</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Local Ollama Support</span>
                  </div>
                </div>
              </motion.div>

              {/* Interactive Mock Preview Card with Pro Hover Lift */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-5"
              >
                <div
                  className="pro-card-hover rounded-2xl border p-5 shadow-2xl space-y-4"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono flex items-center gap-1 text-emerald-500 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      rag-engine: active
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div
                      className="rounded-xl border p-3.5 transition-all hover:border-blue-500/40"
                      style={{
                        backgroundColor: 'var(--card-inner)',
                        borderColor: 'var(--card-border)',
                      }}
                    >
                      <p className="font-semibold text-blue-500 flex items-center gap-1">
                        <Terminal className="h-3.5 w-3.5 text-blue-500" />
                        User Query:
                      </p>
                      <p className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                        &ldquo;Summarize Q3 financial highlights and gross margins.&rdquo;
                      </p>
                    </div>

                    <div
                      className="rounded-xl border p-3.5 space-y-2.5 transition-all hover:border-blue-500/40"
                      style={{
                        backgroundColor: 'var(--card-inner)',
                        borderColor: 'var(--card-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assistant Grounded Response (3 Lines):</span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono px-2 py-0.5 border border-emerald-500/20 font-medium">
                          100% Grounded
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Gross margin expanded by 4.2% driven by enterprise recurring software subscriptions. Operating cash flow reached $14.8M with zero long-term debt.
                      </p>

                      <div
                        className="rounded-lg border p-2 text-[10px] flex items-center justify-between"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--card-border)',
                        }}
                      >
                        <span className="text-blue-500 font-semibold flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Q3_Financial_Report.pdf (Page 4)
                        </span>
                        <span className="font-mono text-emerald-500 font-medium">96% match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== Features Section with Pro Hover Effects ===== */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl space-y-2 mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Core Capabilities
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Engineered for Precision Knowledge Retrieval
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tag }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="pro-card-hover group relative rounded-2xl border p-6 shadow-sm overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] font-mono border"
                    style={{
                      backgroundColor: 'var(--card-inner)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {tag}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-semibold group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== RAG Pipeline Architecture with Hover Cards ===== */}
        <section
          id="how-it-works"
          className="border-y py-24 transition-colors relative"
          style={{
            borderColor: 'var(--card-border)',
            backgroundColor: 'var(--card-inner)',
          }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl space-y-2 mb-14">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Architecture
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                How Retrieval-Augmented Generation Works
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {pipeline.map((item) => {
                const StepIcon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="pro-card-hover group rounded-2xl border p-5 space-y-2.5 shadow-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-500">
                        {item.step}
                      </span>
                      <StepIcon className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-sm font-semibold group-hover:text-blue-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== Security & CTA Section ===== */}
        <section id="security" className="mx-auto max-w-7xl px-6 py-24">
          <div
            className="pro-card-hover rounded-3xl border p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 border border-blue-500/25 text-blue-500 shadow-md">
              <Lock className="h-7 w-7" />
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Ready to Query Your Knowledge Base?
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Upload your PDF documents and ask questions with grounded semantic precision in seconds.
              </p>
            </div>

            <div>
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer
        className="border-t py-8 transition-colors"
        style={{
          borderColor: 'var(--card-border)',
          backgroundColor: 'var(--card-inner)',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p>© {new Date().getFullYear()} AI Knowledge Assistant. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-blue-500 transition">Features</a>
            <a href="#how-it-works" className="hover:text-blue-500 transition">Architecture</a>
            <a href="#security" className="hover:text-blue-500 transition">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
