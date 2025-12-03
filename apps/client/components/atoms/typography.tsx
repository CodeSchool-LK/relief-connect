import * as React from 'react'

import { cn } from '@/utils/shadcn.utils'

function H1({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="h1"
      className={cn(
        'scroll-m-20 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl',
        className
      )}
      {...props}
    />
  )
}

function H2({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="h2"
      className={cn(
        'scroll-m-20 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl',
        className
      )}
      {...props}
    />
  )
}

function H3({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="h3"
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl',
        className
      )}
      {...props}
    />
  )
}

function H4({ className, ...props }: React.ComponentProps<'h4'>) {
  return (
    <h4
      data-slot="h4"
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight md:text-2xl lg:text-3xl',
        className
      )}
      {...props}
    />
  )
}

function H5({ className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5
      data-slot="h5"
      className={cn(
        'scroll-m-20 text-lg font-semibold tracking-tight md:text-xl lg:text-2xl',
        className
      )}
      {...props}
    />
  )
}

function H6({ className, ...props }: React.ComponentProps<'h6'>) {
  return (
    <h6
      data-slot="h6"
      className={cn(
        'scroll-m-20 text-base font-semibold tracking-tight md:text-lg lg:text-xl',
        className
      )}
      {...props}
    />
  )
}

function P({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="p" className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />
  )
}

function PageHeader({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-header"
      className={cn(
        'scroll-m-20 text-2xl font-bold tracking-tight md:text-4xl lg:text-7xl',
        className
      )}
      {...props}
    />
  )
}

function PageSubheader({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-subheader"
      className={cn('text-lg text-muted-foreground md:text-xl', className)}
      {...props}
    />
  )
}

function Lead({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="lead"
      className={cn('text-lg text-muted-foreground md:text-xl', className)}
      {...props}
    />
  )
}

function Small({ className, ...props }: React.ComponentProps<'small'>) {
  return (
    <small
      data-slot="small"
      className={cn('text-sm font-medium leading-none', className)}
      {...props}
    />
  )
}

function Muted({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="muted" className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

function Blockquote({ className, ...props }: React.ComponentProps<'blockquote'>) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn('mt-6 border-l-2 pl-6 italic text-muted-foreground', className)}
      {...props}
    />
  )
}

function Code({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      data-slot="code"
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}
      {...props}
    />
  )
}

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
}

export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  PageHeader,
  PageSubheader,
  Lead,
  Small,
  Muted,
  Blockquote,
  Code,
  Label,
}
