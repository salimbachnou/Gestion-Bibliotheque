import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/reservations.php');
      if (response.data.status === 1) {
        setReservations(response.data.reservations);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios({
        method: 'PUT',
        url: `http://localhost/gestionBiblio/backend/tables/reservations.php?id=${id}`,
        data: { status: newStatus },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 1) {
        await fetchReservations(); // Attendre le rechargement des réservations
        alert(response.data.message);
      } else {
        alert('Erreur: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la réservation');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'emprunte':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En cours</span>;
      case 'retourne':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Retourné</span>;
      case 'en retard':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">En retard</span>;
      case 'en attente':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">En attente</span>;
      default:
        return null;
    }
  };

  // Fonction pour vérifier si un emprunt est en retard
  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };

  const handleAcceptReservation = async (id) => {
    try {
      const response = await axios({
        method: 'PUT',
        url: `http://localhost/gestionBiblio/backend/tables/reservations.php?id=${id}`,
        data: { status: 'emprunte' }
      });

      if (response.data.status === 1) {
        toast.success('Réservation acceptée');
        fetchReservations();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'acceptation de la réservation');
    }
  };

  const handleRejectReservation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir refuser cette réservation ?')) {
      try {
        const response = await axios.delete(
          `http://localhost/gestionBiblio/backend/tables/reservations.php?id=${id}`
        );

        if (response.data.status === 1) {
          toast.success('Réservation refusée');
          fetchReservations();
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du refus de la réservation');
      }
    }
  };

  // Séparer les réservations en attente des autres
  const pendingReservations = reservations.filter(r => r.status === 'en attente');
  const otherReservations = reservations.filter(r => r.status !== 'en attente');

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Gestion des Réservations</h1>

      {/* Table des réservations en attente */}
      <div className="mb-8 bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Réservations en attente ({pendingReservations.length})
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingReservations.map((reservation) => (
                <tr key={reservation.id} className="bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.book_title}</div>
                    <div className="text-sm text-gray-500">{reservation.book_author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.user_prenom} {reservation.user_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAcceptReservation(reservation.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Accepter la réservation"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleRejectReservation(reservation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Refuser la réservation"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table des autres réservations */}
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Autres réservations ({otherReservations.length})
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'emprunt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de retour prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {otherReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.book_title}</div>
                    <div className="text-sm text-gray-500">{reservation.book_author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.user_prenom} {reservation.user_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{reservation.borrow_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{reservation.due_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reservation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {reservation.status === 'emprunte' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(reservation.id, 'retourne')}
                            className="text-green-600 hover:text-green-900"
                            title="Marquer comme retourné"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          {isOverdue(reservation.due_date) && (
                            <button 
                              onClick={() => handleStatusChange(reservation.id, 'en retard')}
                              className="text-red-600 hover:text-red-900"
                              title="Marquer comme en retard"
                            >
                              <ExclamationCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </>
                      )}

                      {reservation.status === 'en retard' && (
                        <button 
                          onClick={() => handleStatusChange(reservation.id, 'retourne')}
                          className="text-green-600 hover:text-green-900"
                          title="Marquer comme retourné"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}

                      {(reservation.status === 'retourne' || reservation.status === 'en retard') && (
                        <button 
                          onClick={() => handleStatusChange(reservation.id, 'emprunte')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Remettre en cours"
                        >
                          <ClockIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune réservation trouvée.
        </div>
      )}
    </div>
  );
}

export default Reservations;