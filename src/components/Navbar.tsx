'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  Shield,
  FileText,
  Search,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Shield },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Search', href: '/search', icon: Search },
    ...(session?.user?.role === 'ADMIN' ? [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Audit', href: '/admin/audit', icon: Settings }
    ] : [])
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Risk Doc Hub
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent transition-colors"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <button
                type="button"
                className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              {/* Profile dropdown menu */}
              {profileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-900">{session?.user?.name}</p>
                      <p className="text-sm text-gray-500">{session?.user?.email}</p>
                      {session?.user?.department && (
                        <p className="text-xs text-gray-400">{session.user.department}</p>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{session?.user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{session?.user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}