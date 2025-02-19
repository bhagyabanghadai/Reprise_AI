import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'

export default function Header() {
  return (
    <header className="py-4 px-6 absolute top-0 left-0 right-0 z-50">
      <nav className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.svg" 
            alt="Reprise" 
            width={32} 
            height={32} 
            className="text-[#00D1C7]"
          />
          <span className="text-2xl font-bold text-white">Reprise</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-white hover:text-[#00D1C7] transition">Features</Link>
          <Link href="/pricing" className="text-white hover:text-[#00D1C7] transition">Pricing</Link>
          <Link href="/about" className="text-white hover:text-[#00D1C7] transition">About</Link>
          <Link href="/community" className="text-white hover:text-[#00D1C7] transition">Community</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-[#00D1C7]">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#00D1C7] hover:bg-[#00B5AC] text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}