import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

const Navbar = ({ toggleDarkMode, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {t('app.name')}
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="absolute left-2 top-2.5">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              {t('courses')}
            </Link>
            <Link to="/books" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              {t('books')}
            </Link>
            <Link to="/questions" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              {t('questions')}
            </Link>
            
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {user ? (
              <Link to="/profile">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                />
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={toggleDarkMode} className="p-2 mr-2">
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 pt-2 pb-3 space-y-2">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300"
              />
              <button type="submit" className="absolute left-2 top-2.5">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
          
          <Link to="/courses" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('courses')}
          </Link>
          <Link to="/books" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('books')}
          </Link>
          <Link to="/questions" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('questions')}
          </Link>
          <Link to="/dictionary" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('dictionary')}
          </Link>
          <Link to="/flashcards" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('flashcards')}
          </Link>
          <Link to="/ai-assistant" className="block py-2 text-gray-700 dark:text-gray-300">
            {t('aiAssistant')}
          </Link>
          
          {user ? (
            <Link to="/profile" className="block py-2 text-gray-700 dark:text-gray-300">
              {t('profile')}
            </Link>
          ) : (
            <Link to="/login" className="block py-2 text-blue-600">
              {t('login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
