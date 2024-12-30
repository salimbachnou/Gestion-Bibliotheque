import Slider from 'react-slick';
import { BookOpenIcon, PhoneIcon, InformationCircleIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Home() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear"
  };

  const slides = [
    {
      url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
      title: 'Bibliothèque Moderne',
      description: 'Découvrez notre collection de livres exceptionnelle'
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da',
      title: 'Espace de Lecture',
      description: 'Un environnement calme et confortable pour votre lecture'
    },
    {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
      title: 'Nouveautés',
      description: 'Explorez nos dernières acquisitions'
    },
  ];

  const quickLinks = [
    {
      icon: <BookOpenIcon className="h-12 w-12 text-blue-600" />,
      title: 'Catalogue',
      description: 'Plus de 10,000 livres disponibles',
      link: '/books'
    },
    {
      icon: <Squares2X2Icon className="h-12 w-12 text-blue-600" />,
      title: 'Catégories',
      description: 'Parcourez par genre',
      link: '/categories'
    },
    {
      icon: <InformationCircleIcon className="h-12 w-12 text-blue-600" />,
      title: 'Services',
      description: 'Découvrez nos services',
      link: '/services'
    },
    {
      icon: <PhoneIcon className="h-12 w-12 text-blue-600" />,
      title: 'Contact',
      description: "Besoin d'aide ?",
      link: '/contact'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slider */}
      <div className="relative max-w-6xl mx-auto">
        <Slider {...sliderSettings}>
          {slides.map((slide, index) => (
            <div key={index} className="relative h-[400px] md:h-[500px] px-2">
              <img 
                src={slide.url} 
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">{slide.title}</h2>
                <p className="text-lg md:text-xl text-center max-w-2xl">{slide.description}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Welcome Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Bienvenue à BiblioTech</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Votre destination pour la lecture, l'apprentissage et la découverte. 
            Explorez notre vaste collection de livres et profitez de nos services modernes.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <a 
                    href={item.link}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    En savoir plus →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-xl">Livres Disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-xl">Membres Actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-xl">Accès en Ligne</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Prêt à commencer votre voyage littéraire ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez notre communauté et découvrez un monde de connaissances
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="/register" 
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              S'inscrire maintenant
            </a>
            <a 
              href="/about" 
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 