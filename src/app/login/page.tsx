"use client";

import React from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button';

export default function Login() {
    const handleLogin = async (provider: string) => {
        await authClient.signIn.social({ provider });
    };

    return (
        <div>
            <Button onClick={() => handleLogin('github')}>Login with Github</Button>
            <Button onClick={() => handleLogin('google')}>Login with Google</Button>
        </div>
    )
}
