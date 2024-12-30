import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  BookOpenIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex justify-between h-16">
          <div className="flex flex-1">
            <Link to="/" className="flex-shrink-0 flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">BiblioTech</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex space-x-8">
              <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Accueil
              </Link>
              <Link to="/books" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Livres
              </Link>
              <Link to="/categories" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Catégories
              </Link>
              <Link to="/services" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Services
              </Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                À Propos
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center">
            {currentUser ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                  <UserCircleIcon className="w-5 h-5 mr-2" />
                  {currentUser.prenom} {currentUser.name}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <UserCircleIcon className="w-5 h-5 mr-2" />
                            Mon Profil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile/loans"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <BookOpenIcon className="w-5 h-5 mr-2" />
                            Mes Emprunts
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile/reservations"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Mes Réservations
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-gray-100">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:text-red-700`}
                            >
                              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                              Déconnexion
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium
                           bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white rounded-lg shadow-sm 
                           hover:from-blue-700 hover:to-blue-800
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           transform transition-all duration-200 ease-in-out
                           hover:scale-105 active:scale-95"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <Transition
          show={isOpen}
          enter="transition duration-200 ease-out"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition duration-100 ease-in"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Accueil
              </Link>
              <Link to="/books" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                Livres
              </Link>
              <Link to="/categories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                Catégories
              </Link>
              <Link to="/services" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                Services
              </Link>
              <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                À Propos
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                Contact
              </Link>
            </div>

            {currentUser ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {currentUser.prenom} {currentUser.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                    Mon Profil
                  </Link>
                  <Link to="/profile/loans" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                    Mes Emprunts
                  </Link>
                  <Link to="/profile/reservations" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                    Mes Réservations
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-base font-medium text-blue-600 hover:bg-gray-50"
                  >
                    Inscription
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Transition>
      </div>
    </nav>
  );
}

export default Navbar; 