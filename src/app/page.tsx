"use client";

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImSpinner3 } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";
import HowItWorks from '@/components/sections/how-it-works';
import ApiWaitlist from '@/components/sections/api-waitlist';
import HeroSvg from '@/components/hero-svg';

function getEyeTransform(e: MouseEvent, ref: React.RefObject<HTMLElement | HTMLImageElement | null>, maxDistance = 200, maxShift = 50) {
  if (!ref.current) return 'translate(0%, 0%)';
  const rect = ref.current.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distanceX = Math.max(-maxDistance, Math.min(maxDistance, e.clientX - centerX));
  const distanceY = Math.max(-maxDistance, Math.min(maxDistance, e.clientY - centerY));
  const percentageX = maxShift * (distanceX / maxDistance);
  const percentageY = maxShift * (distanceY / maxDistance);
  return `translate(${percentageX}%, ${percentageY}%)`;
}

export default function Home() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const session = sessionData?.session;
  const isLoggedIn = !!session;
  const [catEyeTransform, setCatEyeTransform] = useState('translate(0%, 0%)');
  const catImgRef = React.useRef<HTMLImageElement>(null);
  const fishImgRef = React.useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    setCatEyeTransform(getEyeTransform(e, catImgRef));
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
      let blobUrl: string;
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');

      if (logo.startsWith('data:')) {
        const [header, base64] = logo.split(',');
        const mime = header.match(/:(.*?);/)?.[1] ?? 'image/svg+xml';
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: mime });
        blobUrl = URL.createObjectURL(blob);
      } else {
        const response = await fetch(logo);
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
      }

      const ext = logo.startsWith('data:image/svg') ? 'svg' : logo.split('.').pop()?.split('?')[0] ?? 'png';
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${hostname}-logo.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(logo, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 pt-12 sm:pt-18 w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-12 xl:px-24">

          <div className="flex flex-col items-center lg:items-start lg:flex-1 lg:max-w-md">
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <HeroSvg className="w-60 sm:w-70 h-auto" />

              <p className="text-muted-foreground text-sm sm:text-base">
                Finds logo of sites for you 😺
              </p>
            </div>

            <div className="w-full flex justify-center lg:justify-start">
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Input
                  className={`flex-1 min-w-0 ${error ? 'border-destructive bg-destructive/5 text-destructive' : ''}`}
                  placeholder="Enter a website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchLogo();
                    }
                  }}
                />
                <Button onClick={handleFetchLogo} disabled={loading} className="shrink-0">
                  {loading ? 'Getting...' : 'Get Logo'}
                </Button>
              </div>
            </div>

            {logo && (
              <div className="mt-4 hidden lg:flex">
                <Button onClick={handleDownload} variant="secondary">
                  Download <IoMdDownload className="ml-2" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center lg:flex-shrink-0">
            <div className="mt-6 sm:mt-8 lg:mt-0 relative w-64 lg:w-96 aspect-square">
              {error ? (
                <Image src="/cat-error.svg" alt="Cat Error" fill ref={catImgRef} />
              ) : loading ? (
                <Image src="/cat-loading.svg" alt="Cat Loading" fill ref={catImgRef} />
              ) : logo ? (
                <Image src="/cat-success.svg" alt="Cat Success" fill ref={catImgRef} />
              ) : (
                <Image src="/cat-idle.svg" alt="Cat Idle" fill ref={catImgRef} />
              )}

              <span
                className="absolute top-[31%] left-[31.5%] size-[2%] -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
                style={{ transform: catEyeTransform }}
              />
              <span
                className="absolute top-[31%] left-[51.5%] size-[2%] -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
                style={{ transform: catEyeTransform }}
              />

              {loading && (
                <ImSpinner3 className="size-[14%] absolute top-[2%] left-[45%] -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
              )}

              {logo && (
                <img
                  src={logo}
                  alt="fetched Logo"
                  className="size-[30%] absolute border-2 shadow-lg rounded-md bottom-[40%] right-[87%] bg-card object-contain p-1"
                />
              )}

              {error && (
                <p className="text-center text-destructive absolute bottom-0 w-full translate-y-5 text-sm font-medium">
                  {error}
                </p>
              )}
            </div>

            {logo && (
              <div className="mt-4 flex lg:hidden">
                <Button onClick={handleDownload} variant="secondary">
                  Download <IoMdDownload className="ml-2" />
                </Button>
              </div>
            )}
          </div>

        </div>

        <div className="mb-8 items-center hidden sm:flex mt-12">
          <div className="relative w-48 md:w-52 lg:w-64">
            <Image
              src="/fish-toy.svg"
              alt="Fish"
              height={379}
              width={516}
              className="w-full h-auto"
              ref={fishImgRef}
            />
          </div>

          <div className="size-38 md:size-48 lg:size-52 ml-auto">
            <Image
              src="/cat-food.svg"
              alt="Cat Food"
              height={500}
              width={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <HowItWorks />

      <ApiWaitlist />

    </main>
  )
}