import { useState, useEffect } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Books() {
  const [filter, setFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [reservationDates, setReservationDates] = useState({
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/public_books.php');
      if (response.data.status === 1) {
        setBooks(response.data.books);
      } else {
        toast.error('Erreur lors du chargement des livres');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (book) => {
    if (!isAuthenticated) {
      toast.info('Veuillez vous connecter pour emprunter un livre');
      navigate('/login');
      return;
    }

    setSelectedBook(book);
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost/gestionBiblio/backend/tables/reservations.php', {
        user_id: currentUser.id,
        book_id: selectedBook.id,
        borrow_date: reservationDates.borrowDate,
        return_date: reservationDates.returnDate
      });

      if (response.data.status === 1) {
        toast.success('Demande de réservation envoyée avec succès');
        setShowReservationModal(false);
        fetchBooks();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la réservation');
    }
  };

  const handleShowDetails = (book) => {
    setCurrentBook(book);
    setShowDetailsModal(true);
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    if (filter === 'available') return book.statut === 'disponible' && book.quantity > 0;
    if (filter === 'borrowed') return book.statut === 'emprunte' || book.quantity <= 0;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Nos Livres</h1>
        
        {/* Filtre de disponibilité */}
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-48 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les livres</option>
            <option value="available">Disponibles</option>
            <option value="borrowed">Empruntés</option>
          </select>
        </div>
      </div>

      {/* Grille de livres */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{book.author}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">{book.category}</span>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  book.status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.status === 'available' ? 'Disponible' : 'Emprunté'}
                  {book.status === 'available' && book.quantity > 1 && ` (${book.quantity})`}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleShowDetails(book)}
                  className="flex items-center justify-center px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Détails
                </button>
                <button 
                  onClick={() => handleBorrow(book)}
                  className={`flex-1 py-2 rounded-md text-white font-medium transition-colors ${
                    book.statut === 'disponible' && book.quantity > 0
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={book.statut !== 'disponible' || book.quantity <= 0}
                  
                >
                  {book.statut === 'disponible' && book.quantity > 0
                    ? isAuthenticated 
                      ? 'Emprunter'
                      : 'Connectez-vous pour emprunter'
                    : 'Indisponible'
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal des détails du livre */}
      {showDetailsModal && currentBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-medium text-gray-900">
                  Détails du livre
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1">
                  <img
                    src={currentBook.cover}
                    alt={currentBook.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>

                <div className="col-span-2 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold">{currentBook.title}</h4>
                    <p className="text-gray-600">{currentBook.author}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <p className="font-medium">{currentBook.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <p className={`font-medium ${
                        currentBook.status === 'available' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentBook.status === 'available' ? 'Disponible' : 'Emprunté'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Éditeur</p>
                      <p className="font-medium">{currentBook.publisher}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Année de publication</p>
                      <p className="font-medium">{currentBook.publicationYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Langue</p>
                      <p className="font-medium">{currentBook.language}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pages</p>
                      <p className="font-medium">{currentBook.pages}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700 mt-1">{currentBook.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Emplacement</p>
                    <p className="font-medium">{currentBook.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {showReservationModal && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Réserver un livre
                </h3>
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800">{selectedBook.title}</h4>
                <p className="text-sm text-gray-600">{selectedBook.author}</p>
              </div>

              <form onSubmit={handleReservationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date d'emprunt souhaitée
                  </label>
                  <input
                    type="date"
                    value={reservationDates.borrowDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setReservationDates(prev => ({
                      ...prev,
                      borrowDate: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date de retour prévue
                  </label>
                  <input
                    type="date"
                    value={reservationDates.returnDate}
                    min={reservationDates.borrowDate}
                    onChange={(e) => setReservationDates(prev => ({
                      ...prev,
                      returnDate: e.target.value
                    }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p>En réservant ce livre, vous acceptez :</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>D'attendre la confirmation de votre réservation</li>
                    <li>De respecter les dates d'emprunt et de retour</li>
                    <li>De maintenir le livre en bon état</li>
                    <li>De respecter le règlement de la bibliothèque</li>
                  </ul>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Réserver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Aucun livre ne correspond à votre sélection.
          </p>
        </div>
      )}
    </div>
  );
}

export default Books; 