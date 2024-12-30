import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Notification from '../../components/Notification';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/categories.php');
      if (response.data.status === 1) {
        setCategories(response.data.categories);
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      showNotification('Erreur lors du chargement des catégories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showNotification('Le nom de la catégorie est requis', 'error');
      return;
    }

    try {
      const response = await axios({
        method: currentCategory ? 'PUT' : 'POST',
        url: `http://localhost/gestionBiblio/backend/tables/categories.php${currentCategory ? `?id=${currentCategory.id}` : ''}`,
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 1) {
        showNotification(response.data.message);
        fetchCategories();
        setShowModal(false);
        setFormData({ name: '', description: '' });
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost/gestionBiblio/backend/tables/categories.php?id=${id}`);
      
      if (response.data.status === 1) {
        showNotification(response.data.message);
        fetchCategories();
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

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
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
        <h1 className="text-3xl font-semibold text-gray-800">Gestion des Catégories</h1>
        <button
          onClick={() => {
            setCurrentCategory(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouvelle Catégorie
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre de Livres
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{category.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.book_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {currentCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-4">
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
                    {currentCategory ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories; 