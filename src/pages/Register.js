function Register() {
  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre email"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre mot de passe"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirmez votre mot de passe"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register; 