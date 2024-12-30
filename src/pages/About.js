function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">À Propos de Nous</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">
          Bienvenue dans notre bibliothèque moderne et accueillante. Nous sommes dédiés à 
          promouvoir la lecture et le partage des connaissances dans notre communauté.
        </p>
        <p className="text-gray-600 mb-4">
          Notre collection comprend plus de 10,000 livres couvrant tous les genres, 
          des classiques de la littérature aux dernières nouveautés.
        </p>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Notre Mission</h2>
          <p className="text-gray-600">
            Rendre la lecture accessible à tous et créer un espace d'apprentissage 
            et de découverte pour notre communauté.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About; 