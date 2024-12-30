import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { UserGroupIcon, BookOpenIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    recentActivities: [],
    monthlyUsers: [],
    monthlyLoans: [],
    booksByCategory: [],
    bookStatus: [],
    loanStatus: [],
    overdueBooks: 0,
    topBooks: [],
    avgDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost/gestionBiblio/backend/dashboard_stats.php');
        
        if (response.data.status === 1) {
          setStats(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Utilisateurs Total',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Livres Total',
      value: stats.totalBooks,
      icon: BookOpenIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Emprunts Actifs',
      value: stats.activeLoans,
      icon: ArrowTrendingUpIcon,
      color: 'bg-yellow-500'
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 py-4">{error}</div>;

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des emprunts'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12
        }
      },
      title: {
        display: true,
        text: 'Répartition par catégorie'
      }
    }
  };

  const chartColors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
  ];

  const monthlyUsersData = {
    labels: stats.monthlyUsers?.map(item => {
      if (!item || !item.month) return '';
      const [year, month] = item.month.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }) || [],
    datasets: [{
      label: 'Nombre d\'utilisateurs',
      data: stats.monthlyUsers?.map(item => item?.count || 0) || [],
      borderColor: chartColors[0],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.3,
      fill: true
    }]
  };

  const categoryData = {
    labels: stats.booksByCategory?.map(item => item?.category || 'Non catégorisé') || [],
    datasets: [{
      data: stats.booksByCategory?.map(item => item?.count || 0) || [],
      backgroundColor: chartColors,
      borderColor: chartColors.map(color => color.replace('0.7', '1')),
      borderWidth: 1
    }]
  };

  // Données pour le graphique des statuts d'emprunts
  const loanStatusData = {
    labels: stats.loanStatus?.map(status => {
      const labels = {
        'emprunte': 'En cours',
        'retourne': 'Retournés',
        'en retard': 'En retard'
      };
      return labels[status.status] || status.status;
    }) || [],
    datasets: [{
      data: stats.loanStatus?.map(status => status.count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', // Bleu pour en cours
        'rgba(16, 185, 129, 0.7)', // Vert pour retournés
        'rgba(239, 68, 68, 0.7)',  // Rouge pour en retard
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Tableau de bord</h1>
      
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-xl p-3 text-white mr-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nouvelles cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 text-sm font-medium">Emprunts en retard</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-red-600">{stats.overdueBooks}</p>
            <p className="ml-2 text-sm text-gray-500">livres</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-500 text-sm font-medium">Durée moyenne d'emprunt</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-800">{stats.avgDuration}</p>
            <p className="ml-2 text-sm text-gray-500">jours</p>
          </div>
        </div>
      </div>

      {/* Top 5 des livres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Livres les plus empruntés</h2>
        <div className="space-y-4">
          {stats.topBooks?.map((book, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-400 w-8">{index + 1}</span>
                <span className="text-gray-800">{book.title}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600">{book.borrow_count}</span>
                <span className="text-xs text-gray-500 ml-1">emprunts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique des statuts d'emprunts */}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Livres par catégorie</h2>
          <div className="h-[300px]">
            <Doughnut
              data={categoryData}
              options={doughnutChartOptions}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Statuts des emprunts</h2>
        <div className="h-[300px]">
          <Doughnut
            data={loanStatusData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    usePointStyle: true,
                    padding: 20
                  }
                }
              }
            }}
          />
        </div>
      </div>
        
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activités Récentes</h2>
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-gray-800 text-sm font-medium">
                    {activity.action} - {activity.book_title}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    par {activity.user_name} • {formatDate(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

export default Dashboard;