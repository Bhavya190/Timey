'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // here you could also clear auth state or cookies later
    router.replace('/'); // go back to login/signup
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-500 transition"
    >
      Logout
    </button>
  );
}
