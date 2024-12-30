import { useState } from 'react';
import { BookOpenIcon, CalendarIcon, XCircleIcon } from '@heroicons/react/24/outline';

function MyReservations() {
  const [reservations] = useState([
    {
      id: 1,
      bookTitle: "Dune",
      author: "Frank Herbert",
      requestDate: "2024-01-20",
      status: "en_attente",
      availabilityDate: "2024-02-01"
    },
    {
      id: 2,
      bookTitle: "Fondation",
      author: "Isaac Asimov",
      requestDate: "2024-01-18",
      status: "confirmée",
      availabilityDate: "2024-01-25"
    },
    {
      id: 3,
      bookTitle: "Neuromancien",
      author: "William Gibson",
      requestDate: "2024-01-15",
      status: "annulée",
      availabilityDate: null
    }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'en_attente':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'confirmée':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Confirmée</span>;
      case 'annulée':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Annulée</span>;
      default:
        return null;
    }
  };

  const handleCancelReservation = (id) => {
    // Logique d'annulation à implémenter
    console.log('Annulation de la réservation:', id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mes Réservations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{reservation.bookTitle}</h3>
                  <p className="text-sm text-gray-600">{reservation.author}</p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  <span>Demande effectuée le: {reservation.requestDate}</span>
                </div>
                {reservation.availabilityDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    <span>Disponible à partir du: {reservation.availabilityDate}</span>
                  </div>
                )}
              </div>

              {reservation.status === 'en_attente' && (
                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="mt-4 flex items-center text-red-600 hover:text-red-800"
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  <span>Annuler la réservation</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReservations; 