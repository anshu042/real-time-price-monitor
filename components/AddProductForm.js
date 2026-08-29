"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { addProduct } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Link2, Plus, Check } from "lucide-react";
import { toast } from "sonner";

// Loaded only when an unauthenticated visitor tries to track a product.
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });

export default function AddProductForm({ user }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const resetTimer = useRef(null);

  // Clear the pending "success -> idle" timer if the form unmounts first.
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const closeModal = useCallback(() => setShowAuthModal(false), []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      const trimmed = url.trim();
      // Validate before hitting the network so obvious mistakes fail instantly.
      if (!/^https?:\/\/\S+$/i.test(trimmed)) {
        toast.error("Enter a valid product URL starting with http or https");
        return;
      }

      setStatus("loading");
      const formData = new FormData();
      formData.append("url", trimmed);

      const result = await addProduct(formData);

      if (result?.error) {
        toast.error(result.error);
        setStatus("idle");
        return;
      }

      setStatus("success");
      toast.success("Tracking initiated");
      setUrl("");
      resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
    },
    [url, user]
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000" />
        
        <div className="relative flex items-center p-1.5 bg-background/80 backdrop-blur-xl border border-primary/20 rounded-full shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
          <div className="pl-4 text-muted-foreground">
            <Link2 className="w-5 h-5" />
          </div>
          
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Product URL to track"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={2048}
            placeholder="Paste product URL (Flipkart, Amazon, etc...)"
            className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-base px-4 w-full placeholder:text-muted-foreground/50"
            required
            disabled={status !== "idle"}
          />
          
          <Button
            type="submit"
            disabled={status !== "idle"}
            size="icon"
            aria-label="Track this product"
            className={`
              h-11 w-11 rounded-full shadow-lg transition-all duration-500 shrink-0
              ${status === "success" 
                ? "bg-green-500 hover:bg-green-600 text-white rotate-[360deg]" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-95"
              }
            `}
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === "success" ? (
              <Check className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </Button>
        </div>
      </form>
      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={closeModal} />
      )}
    </>
  );
}
