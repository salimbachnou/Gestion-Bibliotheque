import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Notification from '../../components/Notification';

function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publication_year: '',
    number_pages: '',
    image: '',
    emplacement: '',
    category_id: '',
    statut: 'disponible',
    quantite: 1
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Charger les livres et les catégories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksResponse, categoriesResponse] = await Promise.all([
        axios.get('http://localhost/gestionBiblio/backend/tables/books.php'),
        axios.get('http://localhost/gestionBiblio/backend/tables/categories.php')
      ]);

      if (booksResponse.data.status === 1) {
        setBooks(booksResponse.data.books);
      }
      if (categoriesResponse.data.status === 1) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        showNotification('L\'image est trop volumineuse. Taille maximum : 2MB', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(
          'http://localhost/gestionBiblio/backend/upload_image.php',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.status === 1) {
          setFormData(prev => ({
            ...prev,
            image: response.data.filename
          }));
          showNotification('Image uploadée avec succès');
        } else {
          showNotification(response.data.message, 'error');
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        showNotification(
          error.response?.data?.message || 'Erreur lors de l\'upload de l\'image',
          'error'
        );
      }
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.publication_year < 1000 || formData.publication_year > new Date().getFullYear()) {
      showNotification('Année de publication invalide', 'error');
      return;
    }

    if (formData.number_pages <= 0) {
      showNotification('Le nombre de pages doit être supérieur à 0', 'error');
      return;
    }

    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
    
    if (!isbnRegex.test(formData.isbn.replace(/-/g, ''))) {
      showNotification('Format ISBN invalide', 'error');
      return;
    }

    try {
      const response = await axios({
        method: currentBook ? 'PUT' : 'POST',
        url: `http://localhost/gestionBiblio/backend/tables/books.php${currentBook ? `?id=${currentBook.id}` : ''}`,
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 1) {
        showNotification(response.data.message);
        fetchData();
        setShowModal(false);
        setFormData({
          title: '',
          author: '',
          isbn: '',
          description: '',
          publication_year: '',
          number_pages: '',
          image: '',
          emplacement: '',
          category_id: '',
          statut: 'disponible',
          quantite: 1
        });
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.message?.includes('Duplicate entry') && error.response?.data?.message?.includes('books_isbn_unique')) {
        showNotification('Cet ISBN existe déjà dans la base de données', 'error');
      } else {
        showNotification(
          error.response?.data?.message || 'Une erreur est survenue',
          'error'
        );
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost/gestionBiblio/backend/tables/books.php?id=${id}`);
      
      if (response.data.status === 1) {
        showNotification(response.data.message);
        fetchData();
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification(
        error.response?.data?.message || 'Erreur lors de la suppression',
        'error'
      );
    }
  };

  const openEditModal = (book) => {
    setCurrentBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description || '',
      publication_year: book.publication_year,
      number_pages: book.number_pages,
      image: book.image || '',
      emplacement: book.emplacement,
      category_id: book.category_id,
      statut: book.statut,
      quantite: book.quantite
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div>
      <Notification
        show={notification.show}
        setShow={(show) => setNotification(prev => ({ ...prev, show }))}
        message={notification.message}
        type={notification.type}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Gestion des Livres</h1>
        <button
          onClick={() => {
            setCurrentBook(null);
            setFormData({
              title: '',
              author: '',
              isbn: '',
              description: '',
              publication_year: '',
              number_pages: '',
              image: '',
              emplacement: '',
              category_id: '',
              statut: 'disponible',
              quantite: 1
            });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau Livre
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Auteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
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
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={book.image ? `http://localhost/gestionBiblio/backend/uploads/books/${book.image}` : '/images/book-placeholder.jpg'} 
                    alt={book.title}
                    className="h-16 w-12 object-cover rounded shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/book-placeholder.jpg';
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.category_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.quantite}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    book.statut === 'disponible' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.statut === 'disponible' ? 'Disponible' : 'Emprunté'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentBook(book);
                        setShowDetailsModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(book)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {currentBook ? 'Modifier le livre' : 'Nouveau livre'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                    className="mt-1 block w-full"
                  />
                  {formData.image && (
                    <img
                      src={`http://localhost/gestionBiblio/backend/uploads/books/${formData.image}`}
                      alt="Prévisualisation"
                      className="mt-2 h-32 w-24 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/book-placeholder.jpg';
                      }}
                    />
                  )}
                  </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700">Titre</label>
                      <input
                        type="text"
                        name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      />
                    </div>

                <div>
                      <label className="block text-sm font-medium text-gray-700">Auteur</label>
                      <input
                        type="text"
                        name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">ISBN</label>
                      <input
                        type="text"
                        name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Ex: 978-2-07-040850-4"
                        required
                      />
                  <p className="mt-1 text-sm text-gray-500">
                    Format: ISBN-13 (ex: 978-2-07-040850-4)
                  </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Année de publication</label>
                      <input
                    type="number"
                    name="publication_year"
                    value={formData.publication_year}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre de pages</label>
                      <input
                        type="number"
                    name="number_pages"
                    value={formData.number_pages}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emplacement</label>
                      <input
                        type="text"
                    name="emplacement"
                    value={formData.emplacement}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                      />
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <input
                        type="number"
                        name="quantite"
                        value={formData.quantite}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      >
                    <option value="disponible">Disponible</option>
                    <option value="emprunte">Emprunté</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                </div>

                <div className="col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {currentBook ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal des détails du livre */}
      {showDetailsModal && currentBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-medium leading-6 text-gray-900 mb-4">
                  Détails du livre
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Colonne de gauche - Image */}
                <div className="col-span-1">
                  <img
                    src={currentBook.image ? `http://localhost/gestionBiblio/backend/uploads/books/${currentBook.image}` : '/images/book-placeholder.jpg'}
                    alt={currentBook.title}
                    className="w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/book-placeholder.jpg';
                    }}
                  />
                </div>

                {/* Colonne du milieu - Informations principales */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold">{currentBook.title}</h4>
                    <p className="text-gray-600">{currentBook.author}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ISBN</p>
                      <p className="font-medium">{currentBook.isbn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <p className="font-medium">{currentBook.category_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Année de publication</p>
                      <p className="font-medium">{currentBook.publication_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nombre de pages</p>
                      <p className="font-medium">{currentBook.number_pages}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Emplacement</p>
                      <p className="font-medium">{currentBook.emplacement}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <span className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                        currentBook.statut === 'disponible' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentBook.statut === 'disponible' ? 'Disponible' : 'Emprunté'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700 mt-1">{currentBook.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(currentBook);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Modifier
                </button>
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
    </div>
  );
}

export default Books; 