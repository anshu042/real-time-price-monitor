"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

// The dialog is only needed once the user chooses to sign in, so its Radix
// dependency is kept out of the initial bundle.
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });

export default function AuthButton({ user }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const closeModal = useCallback(() => setShowAuthModal(false), []);
  const openModal = useCallback(() => setShowAuthModal(true), []);

  if (user) {
    return (
      <form action={signOut}>
        {/* The button is visually compact but keeps a 44px touch area via a
            transparent pseudo-element, so tap-target sizing still passes. */}
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="relative h-8 gap-1.5 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-[calc(100%+0.5rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Sign Out
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button
        onClick={openModal}
        variant="default"
        size="sm"
        className="relative h-8 gap-1.5 bg-blue-500 px-2.5 text-xs hover:bg-green-600 sm:h-9 sm:px-3 sm:text-sm before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-[calc(100%+0.5rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
      >
        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        Sign In
      </Button>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={closeModal} />
      )}
    </>
  );
}
