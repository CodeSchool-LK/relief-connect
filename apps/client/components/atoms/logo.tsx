'use client'

import Image from 'next/image'
import Link from 'next/link'

import logoImage from '@/app/assets/logo.png'
import { cn } from '@/utils/shadcn.utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 53 },
  lg: { width: 200, height: 67 },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const dimensions = sizeMap[size]

  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 transition-opacity hover:opacity-80', className)}
      aria-label="RebuildSL Home"
    >
      <Image
        src={logoImage}
        alt="REBUILDSL - powered by PEOPLE"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="h-auto w-auto"
      />
    </Link>
  )
}

