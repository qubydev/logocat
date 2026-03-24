"use client";

import Image from "next/image";
import React, { useState, FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RiMailSendLine, RiLoader4Line, RiCheckLine } from "react-icons/ri";

export default function ApiWaitlist() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("loading");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            setStatus("success");
        } catch (error) {
            setStatus("error");
        }
    }

    return (
        <section className="py-24 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-8">
                <Image
                    src="/cat-standing.png"
                    alt="Cat Standing"
                    width={500}
                    height={500}
                    className="size-48 sm:size-60 object-contain drop-shadow-sm"
                />

                <div className="flex flex-col items-center gap-2 text-center px-4">
                    <h2 className="text-lg font-medium tracking-tight text-foreground">
                        Our <span className="text-primary">API</span> is coming soon
                    </h2>
                    <p className="text-muted-foreground max-w-md text-sm">
                        Join our waitlist to be the first to try it out!
                    </p>
                </div>

                <div className="w-full max-w-sm flex flex-col items-center gap-2 mt-2 px-4 sm:px-0">
                    {status === "success" ? (
                        <p className="text-green-500 text-center">
                            <RiCheckLine className="inline mr-1" />
                            Thanks! You have been added to the waitlist.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full items-center gap-3">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="flex-1 w-full bg-background"
                                required
                                disabled={status === "loading"}
                            />
                            <Button
                                type="submit"
                                className="w-full sm:w-auto shrink-0 gap-2"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? (
                                    <>
                                        Joining <RiLoader4Line className="animate-spin size-4" />
                                    </>
                                ) : (
                                    <>
                                        Join <RiMailSendLine className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {status === "error" && (
                        <p className="text-sm text-destructive text-center font-medium w-full mt-2">
                            Something went wrong. Please try again.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}