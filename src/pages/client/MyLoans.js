import { useState, useEffect } from 'react';
import { BookOpenIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

function MyLoans() {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetchLoans();
    }
  }, [currentUser?.id]);

  const fetchLoans = async () => {
    try {
      const response = await axios.get(`http://localhost/gestionBiblio/backend/tables/user_loans.php?user_id=${currentUser.id}`);
      
      if (response.data.status === 1) {
        setLoans(response.data.loans);
      } else {
        toast.error('Erreur lors du chargement des emprunts');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des emprunts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'en_cours':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">En cours</span>;
      case 'retard':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">En retard</span>;
      case 'retourné':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Retourné</span>;
      default:
        return null;
    }
  };

  if (!currentUser) {
    return <div className="text-center py-8">Veuillez vous connecter pour voir vos emprunts.</div>;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mes Emprunts</h1>

      {loans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Vous n'avez aucun emprunt en cours.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{loan.bookTitle}</h3>
                    <p className="text-sm text-gray-600">{loan.author}</p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    <span>Emprunté le: {new Date(loan.borrowDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span>À retourner le: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                {loan.status === 'retard' && (
                  <div className="mt-4 flex items-center text-red-600">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm">Veuillez retourner ce livre dès que possible</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyLoans; 