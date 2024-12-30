import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Settings() {
  const [settings, setSettings] = useState({
    id: null,
    libraryName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    loanDuration: 14,
    maxLoansPerUser: 5,
    notifications: {
      emailEnabled: true,
      loanReminders: true,
      newBooks: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/settings.php');
      if (response.data.status === 1 && response.data.settings) {
        const data = response.data.settings;
        setSettings({
          id: data.id,
          libraryName: data.library_name,
          address: data.address,
          city: data.city,
          postalCode: data.postal_code,
          phone: data.phone,
          email: data.email,
          loanDuration: parseInt(data.loan_duration),
          maxLoansPerUser: parseInt(data.max_loans),
          notifications: {
            emailEnabled: data.email_notifications === "1",
            loanReminders: data.loan_reminders === "1",
            newBooks: data.new_books_notifications === "1"
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = settings.id ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url: 'http://localhost/gestionBiblio/backend/tables/settings.php',
        data: settings
      });

      if (response.data.status === 1) {
        toast.success(response.data.message);
        if (!settings.id) {
          fetchSettings();
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Paramètres</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la bibliothèque</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.libraryName}
                  onChange={(e) => setSettings({...settings, libraryName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.city}
                  onChange={(e) => setSettings({...settings, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code postal</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.postalCode}
                  onChange={(e) => setSettings({...settings, postalCode: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.phone}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Règles de prêt */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Règles de Prêt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Durée de prêt (jours)</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.loanDuration}
                  onChange={(e) => setSettings({...settings, loanDuration: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre maximum de prêts par utilisateur</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={settings.maxLoansPerUser}
                  onChange={(e) => setSettings({...settings, maxLoansPerUser: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, emailEnabled: e.target.checked}
                  })}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Activer les notifications par email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.loanReminders}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, loanReminders: e.target.checked}
                  })}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Rappels de retour de prêt
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.newBooks}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, newBooks: e.target.checked}
                  })}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Notifications de nouveaux livres
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings; 