"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close user menu on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as HTMLElement).closest("[data-user-menu]")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  const isActive = (id: string, href: string) => {
    if (id === "qcm") {
      return pathname.startsWith("/qcm");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block" style={{ fontFamily: "var(--font-open-sans)" }}>CiviquePro</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} href={item.href}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive(item.id, item.href)
                    ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-8 h-8 rounded-full border-2 border-violet-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-orange-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {user.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name || user.email}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profil"
                      onClick={() => { setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> Mon profil
                    </Link>
                    <button
                      onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                Se connecter
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href="/login"
                className="sm:hidden p-2 text-violet-600 hover:text-violet-700"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.id} href={item.href} onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg text-left ${isActive(item.id, item.href) ? "text-violet-600 bg-violet-50" : "text-gray-600 hover:bg-gray-50"}`}>
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-lg text-sm font-semibold"
                >
                  Se connecter
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    href="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    <UserIcon className="w-4 h-4" /> Mon profil
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
