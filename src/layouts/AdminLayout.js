import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { icon: <ChartBarIcon className="w-6 h-6" />, title: 'Tableau de bord', path: '/admin' },
    { icon: <UsersIcon className="w-6 h-6" />, title: 'Utilisateurs', path: '/admin/users' },
    { icon: <BookOpenIcon className="w-6 h-6" />, title: 'Livres', path: '/admin/books' },
    { icon: <TagIcon className="w-6 h-6" />, title: 'Catégories', path: '/admin/categories' },
    { icon: <ClockIcon className="w-6 h-6" />, title: 'Réservations', path: '/admin/reservations' },
    { icon: <Cog6ToothIcon className="w-6 h-6" />, title: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-blue-800 text-white w-64 min-h-screen ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="p-4">
          <h2 className="text-2xl font-bold">BiblioTech Admin</h2>
        </div>
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center px-6 py-3 text-gray-100 hover:bg-blue-700"
            >
              {item.icon}
              <span className="mx-4">{item.title}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-100 hover:bg-blue-700 w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            <span className="mx-4">Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
