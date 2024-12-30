import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    address: '',
    ville: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/users.php');
      if (response.data.status === 1) {
        setUsers(response.data.users);
      } else {
        alert('Erreur: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      alert('Erreur lors du chargement des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      ville: user.ville || ''
    });
    setShowModal(true);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentUser) {
      // Mode édition
      try {
        const response = await axios({
          method: 'PUT',
          url: `http://localhost/gestionBiblio/backend/tables/users.php?id=${currentUser.id}`,
          data: formData,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 1) {
          alert(response.data.message);
          fetchUsers();
          setShowModal(false);
        } else {
          alert('Erreur: ' + response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification de l\'utilisateur');
      }
    } else {
      // Mode création
      try {
        const response = await axios({
          method: 'POST',
          url: 'http://localhost/gestionBiblio/backend/tables/users.php',
          data: formData,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.status === 1) {
          alert(response.data.message);
          fetchUsers();
          setShowModal(false);
          setFormData({
            name: '',
            prenom: '',
            email: '',
            password: '',
            role: 'client',
            phone: '',
            address: '',
            ville: ''
          });
        } else {
          alert('Erreur: ' + response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de l\'utilisateur');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await axios.delete(`http://localhost/gestionBiblio/backend/tables/users.php?id=${userId}`);
        
        if (response.data.status === 1) {
          alert(response.data.message);
          fetchUsers();
        } else {
          alert('Erreur: ' + response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={() => {
            setCurrentUser(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openDetailsModal(user)} 
                    className="text-gray-600 hover:text-gray-900 mr-2"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openEditModal(user)} 
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour ajouter/éditer un utilisateur */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {currentUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
              </h3>
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
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                {!currentUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    {currentUser ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails de l'utilisateur
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Prénom</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.prenom}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.address || 'Non renseignée'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ville</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.ville || 'Non renseignée'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rôle</label>
                  <span className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
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

export default Users; 