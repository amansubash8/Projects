import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const auth = getAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      <div className="fixed top-0 w-full bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/tree.png" width={30} height={30} alt="logo" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                GreenGauge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/" 
                className="px-4 py-2 text-gray-700 hover:text-emerald-600 transition-colors"
              >
                Dashboard
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/"
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Dashboard
                </Link>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-16"></div>
    </>
  )
}

export default Navbar