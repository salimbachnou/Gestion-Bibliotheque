function Services() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nos Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Prêt de Livres</h2>
          <p className="text-gray-600">Empruntez des livres pour une durée de 3 semaines.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Espace de Lecture</h2>
          <p className="text-gray-600">Profitez de notre espace calme pour lire et étudier.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Conseils Personnalisés</h2>
          <p className="text-gray-600">Nos bibliothécaires sont là pour vous guider.</p>
        </div>
      </div>
    </div>
  );
}

export default Services; 