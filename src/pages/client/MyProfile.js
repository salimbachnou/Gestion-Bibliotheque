import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

function MyProfile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    prenom: '',
    email: '',
    phone: '',
    address: '',
    ville: '',
    date_of_birth: '',
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserProfile();
    }
  }, [currentUser?.id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost/gestionBiblio/backend/tables/users.php?id=${currentUser.id}`);
      if (response.data.status === 1 && response.data.user) {
        setProfile(response.data.user);
      } else {
        toast.error('Erreur lors du chargement du profil');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost/gestionBiblio/backend/tables/users.php?id=${currentUser.id}`,
        profile
      );

      if (response.data.status === 1) {
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    return <div className="text-center py-8">Veuillez vous connecter pour accéder à votre profil.</div>;
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Modifier le profil
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations Personnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Prénom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="prenom"
                    value={profile.prenom}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.prenom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nom</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date de naissance</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profile.date_of_birth || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">
                    {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.email}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coordonnées</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.phone || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Adresse</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={profile.address || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.address || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Ville</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ville"
                    value={profile.ville || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{profile.ville}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchUserProfile(); // Recharger les données originales
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default MyProfile; 