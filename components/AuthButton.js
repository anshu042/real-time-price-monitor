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
        <Button variant="ghost" size="sm" type="submit" className="gap-2">
          <LogOut className="w-4 h-4" />
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
        className="bg-blue-500 hover:bg-green-600 gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={closeModal} />
      )}
    </>
  );
}
