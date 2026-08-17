import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
        <SignUp routing="path" path="/sign-up" forceRedirectUrl="/dashboard" />
      </div>
    </main>
  );
}
