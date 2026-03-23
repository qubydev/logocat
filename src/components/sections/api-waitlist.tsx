"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaEnvelope, FaPaperPlane, FaTerminal } from "react-icons/fa";

export default function ApiWaitlist() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        setTimeout(() => {
            setStatus("success");
            setEmail("");
        }, 1500);
    };

    return (
        <section className="py-24 px-4 w-full max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/20 px-6 py-16 sm:px-12 sm:py-20 text-center flex flex-col items-center"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <FaTerminal className="size-7" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground z-10">
                    Integrate <span className="text-primary font-handlee">logocat</span> API
                </h2>

                <p className="text-muted-foreground text-lg max-w-xl mb-10 z-10">
                    Automate logo extraction in your own applications. Join the waitlist to get early access to our REST API.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md z-10">
                    <div className="relative w-full">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            className="pl-10 h-12 w-full bg-background"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading" || status === "success"}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-12 w-full sm:w-auto px-8 shrink-0"
                        disabled={status === "loading" || status === "success"}
                    >
                        {status === "loading" ? (
                            "Joining..."
                        ) : status === "success" ? (
                            "Added!"
                        ) : (
                            <>
                                Join <FaPaperPlane className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </form>
            </motion.div>
        </section>
    );
}