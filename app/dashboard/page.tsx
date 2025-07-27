'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    setUser(user);
    
    // Redirect based on role
    switch (user.role) {
      case 'DCP':
        router.push('/dashboard/dcp');
        break;
      case 'ACP':
        router.push('/dashboard/acp');
        break;
      case 'PI':
        router.push('/dashboard/pi');
        break;
      case 'Inspector':
        router.push('/dashboard/inspector');
        break;
      case 'SubInspector':
        router.push('/dashboard/subinspector');
        break;
      default:
        // Stay on this page for unknown roles
        break;
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-white">Redirecting to your dashboard...</div>
    </div>
  );
} 