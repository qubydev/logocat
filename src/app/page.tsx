"use client";
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImSpinner3 } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";


export default function Home() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const session = sessionData?.session;
  const isLoggedIn = !!session;

  const [eyeBallTransform, setEyeBallTransform] = useState('translate(50%, 50%)');
  const catImgRef = React.useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const MAX_DISTANCE = 200;
    if (!catImgRef.current) return;
    const rect = catImgRef.current.getBoundingClientRect();
    const catCenterX = rect.left + rect.width / 2;
    const catCenterY = rect.top + rect.height / 2;
    const distanceX = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, e.clientX - catCenterX));
    const distanceY = Math.max(-MAX_DISTANCE, Math.min(MAX_DISTANCE, e.clientY - catCenterY));
    const percentageX = 50 * (distanceX / MAX_DISTANCE);
    const percentageY = 50 * (distanceY / MAX_DISTANCE);
    setEyeBallTransform(`translate(${percentageX}%, ${percentageY}%)`);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fetchSession = async () => {
    const { data } = await authClient.getSession();
    setSessionData(data);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleFetchLogo = async () => {
    setError(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
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
        body: JSON.stringify({ url: url.trim() }),
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

  const handleDownload = async () => {
    if (!logo) return;
    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = blob.type.split('/')[1] || 'png';
      const hostname = new URL(url).hostname.replace('www.', '');
      a.download = `${hostname}-logo.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(logo, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpen = () => {
    if (!logo) return;
    window.open(logo, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pt-10" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-foreground/70">
            CATCH ANY SITE'S<br />
            <span className='text-primary'>LOGO</span> INSTANTLY...
          </h1>
          <p className="text-muted-foreground text-base">
            Paste a website URL and get the logo in one click.
          </p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <Input
              className={`w-80 ${error ? 'border-red-500 bg-red-500/5 text-red-500' : ''}`}
              placeholder="Enter a website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFetchLogo();
                }
              }}
            />
            <Button onClick={handleFetchLogo} disabled={loading}>
              {loading ? 'Getting...' : 'Get Logo'}
            </Button>
          </div>
        </div>
        <div className='mt-8 relative'>
          {error ? (
            <Image
              src="/cat-error.svg"
              alt="Cat Logo"
              width={500}
              height={500}
              className="size-68"
              ref={catImgRef}
            />
          ) : loading ? (
            <Image
              src="/cat-loading.svg"
              alt="Cat Logo"
              width={500}
              height={500}
              className="size-68"
              ref={catImgRef}
            />
          ) : logo ? (
            <Image
              src="/cat-success.svg"
              alt="Cat Logo"
              width={500}
              height={500}
              className="size-68"
              ref={catImgRef}
            />
          ) : (
            <Image
              src="/cat-idle.svg"
              alt="Cat Logo"
              width={500}
              height={500}
              className="size-68"
              ref={catImgRef}
            />
          )}

          {/* Eye balls */}
          <span
            className='absolute top-[30%] left-[30%] size-[2%] bg-white rounded-full'
            style={{
              transform: eyeBallTransform,
            }}
          />
          <span
            className='absolute top-[30%] left-[50%] size-[2%] bg-white rounded-full'
            style={{
              transform: eyeBallTransform,
            }}
          />

          {/* Spinner */}
          {!loading && (
            <ImSpinner3
              className='size-[14%] absolute top-[2%] left-[45%] -translate-x-1/2 -translate-y-1/2 animate-spin'
            />
          )}

          {/* Logo */}
          {logo && (
            <img
              src={logo}
              alt="fetched Logo"
              className="size-[30%] absolute border-2 shadow-lg rounded-md bg-card bottom-[40%] right-[87%]"
            />
          )}

          {/* Error */}
          {error && (
            <p className='text-center text-red-500 absolute bottom-0 w-full translate-y-5'>{error}</p>
          )}
        </div>
        {logo && (
          <Button
            onClick={handleDownload}
          >Download <IoMdDownload /></Button>
        )}
      </div>
    </div>
  )
}