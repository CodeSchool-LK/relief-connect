'use client'

import { useState } from 'react'
import { MenuIcon, PlusIcon } from 'lucide-react'

import { Logo } from '@/components/atoms/logo'
import { Button } from '@/components/atoms/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/atoms/sheet'
import { LanguageSelector } from '@/components/molecules/common/language-selector'
import { UserMenu } from '@/components/molecules/common/user-menu'
import { LoginDialog } from '@/components/organisms/auth/login-dialog'
import { useAuthStore } from '@/stores/auth.store'

export function Navbar() {
  const { isAuthenticated } = useAuthStore()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-neutral-900/70 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Left side - Logo */}
          <Logo size="md" />

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-4 md:flex">
            <LanguageSelector />
            {!isAuthenticated && (
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => setIsLoginDialogOpen(true)}
              >
                Volunteer Login
              </Button>
            )}
            {isAuthenticated && <UserMenu />}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              aria-label="Quick actions"
            >
              <PlusIcon className="size-5" />
            </Button>
          </div>

          {/* Mobile Right Side - Hamburger Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-neutral-900 text-white sm:w-[350px]">
              <div className="flex flex-col gap-4 pt-6">
                <div className="w-full">
                  <LanguageSelector />
                </div>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => {
                      setIsLoginDialogOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Volunteer Login
                  </Button>
                )}
                {isAuthenticated && (
                  <div className="w-full">
                    <UserMenu />
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusIcon className="mr-2 size-5" />
                  Quick Actions
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Login Dialog */}
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
    </>
  )
}
