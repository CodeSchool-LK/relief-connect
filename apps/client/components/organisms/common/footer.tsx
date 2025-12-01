import Link from 'next/link'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from 'lucide-react'
import { Logo } from '@/components/atoms/logo'
import { H6, Small, Muted } from '@/components/atoms/typography'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size="md" />
            <Muted className="text-neutral-400 text-sm leading-relaxed">
              Connecting communities in need with volunteers and organizations across Sri Lanka. Together, we rebuild
              and restore hope.
            </Muted>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <H6>Quick Links</H6>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/request-help" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Request Help
              </Link>
              <Link href="/provide-help" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Provide Help
              </Link>
              <Link href="/organizations" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Organizations
              </Link>
              <Link href="/events" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Events
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <H6>Resources</H6>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors text-sm">
                About Us
              </Link>
              <Link href="/how-it-works" className="text-neutral-400 hover:text-white transition-colors text-sm">
                How It Works
              </Link>
              <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors text-sm">
                FAQ
              </Link>
              <Link href="/volunteer" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Become a Volunteer
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <H6>Get in Touch</H6>
            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <div className="flex items-start gap-3">
                <Mail className="size-4 shrink-0 mt-0.5 text-accent" />
                <span>support@rebuildsl.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-4 shrink-0 mt-0.5 text-accent" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="size-4 shrink-0 mt-0.5 text-accent" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Small className="text-neutral-500">
              © {currentYear} RebuildSL.com (Rebuild Sri Lanka). All rights reserved.
            </Small>
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <span>Made with</span>
              <Heart className="size-4 text-red-500 fill-red-500" />
              <span>for Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

