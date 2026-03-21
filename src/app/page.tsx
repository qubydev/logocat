"use client";
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const session = sessionData?.session;
  const isLoggedIn = !!session;

  const fetchSession = async () => {
    const { data } = await authClient.getSession();
    setSessionData(data);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleFetchLogo = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setLogo(null);
    setError(null);

    try {
      const res = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setLogo(data.logo);
      }
    } catch {
      setError('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 p-8 max-w-md">
      <div className="flex gap-2">
        <Input
          placeholder="Paste link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleFetchLogo} disabled={loading}>
          {loading ? 'Fetching...' : 'Get logo'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {logo && (
        <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
      )}

      {isLoggedIn && (
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      )}
    </div>
  )
}