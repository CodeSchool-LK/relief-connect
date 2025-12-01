'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { useAuthStore } from '@/stores/auth.store'

export function UserMenu() {
  const { user, logout } = useAuthStore()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="User menu"
        >
          <Avatar className="size-8">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-white/20 text-white">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="md:inline-block">{user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

