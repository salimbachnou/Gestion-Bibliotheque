import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Contact() {
  const [settings, setSettings] = useState({
    library_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(true);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost/gestionBiblio/backend/tables/settings.php');
      if (response.data.status === 1) {
        setSettings(response.data.settings);
      } else {
        toast.error('Erreur lors du chargement des informations');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des informations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/gestionBiblio/backend/tables/contact.php', formData);
      if (response.data.status === 1) {
        e.target.reset();
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        
        toast.success('Message envoyé avec succès');
        setMessageSent(true);

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      message: ''
    });
    setMessageSent(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contactez-nous</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {messageSent ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-xl font-semibold mb-4">
                Message envoyé avec succès !
              </div>
              <p className="text-gray-600 mb-6">
                Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={resetForm}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Formulaire de Contact</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Utilisez ce formulaire pour :
                </p>
                <ul className="list-disc list-inside text-sm text-blue-600 mt-2">
                  <li>Poser une question sur nos services</li>
                  <li>Signaler un problème</li>
                  <li>Faire une suggestion</li>
                  <li>Demander des informations supplémentaires</li>
                </ul>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Message
                    <span className="text-red-500 ml-1">*</span>
                    <span className="text-sm text-gray-500 ml-2">(Minimum 10 caractères)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Décrivez votre demande en détail..."
                    required
                    minLength={10}
                  ></textarea>
                </div>
                <div className="text-sm text-gray-500 italic">
                  * Champs obligatoires
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <span>Envoyer le message</span>
                </button>
              </form>
            </>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Bibliothèque</h3>
              <p className="text-gray-600">{settings.library_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Adresse</h3>
              <p className="text-gray-600">{settings.address}</p>
              <p className="text-gray-600">{settings.postal_code} {settings.city}</p>
            </div>
            <div>
              <h3 className="font-medium">Téléphone</h3>
              <p className="text-gray-600">{settings.phone}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-gray-600">{settings.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Horaires</h3>
              <p className="text-gray-600">Lundi - Vendredi: 9h - 19h</p>
              <p className="text-gray-600">Samedi: 10h - 18h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 