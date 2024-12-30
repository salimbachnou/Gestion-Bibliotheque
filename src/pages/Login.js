import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [data, setData] = useState([]);
    const [email, setEmail] = useState("");
    const [pass, setpass] = useState("");
    const [error, setError] = useState({
        email: "",
        password: ""
    });

    const getLogin = async () => {
        try {
            const response = await axios.get('http://localhost/gestionBiblio/backend/tables/login.php');
            console.log('API Response:', response.data); // Pour le débogage
            
            if (response.data && response.data.status === 1) {
                // S'assurer que data est un tableau
                const users = Array.isArray(response.data.data) ? response.data.data : [];
                setData(users);
            } else {
                console.error('Erreur API:', response.data?.error);
                setData([]);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setData([]);
        }
    };

    useEffect(() => {
        getLogin();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({ email: "", password: "" });

        // Vérifier que data est un tableau
        if (!Array.isArray(data)) {
            console.error('Data n\'est pas un tableau:', data);
            setError(prev => ({ 
                ...prev, 
                email: "Erreur de chargement des données" 
            }));
            return;
        }

        const user = data.find(u => u.email === email);
        
        if (!user) {
            setError(prev => ({ ...prev, email: "Email incorrect" }));
            return;
        }

        if (user.password !== pass) {
            setError(prev => ({ ...prev, password: "Mot de passe incorrect" }));
            return;
        }

        try {
            await login({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                prenom: user.prenom
            });

            // La redirection est maintenant gérée dans le contexte d'authentification
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setError(prev => ({ 
                ...prev, 
                password: "Une erreur est survenue lors de la connexion" 
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Connexion à BiblioTech
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        créez un compte gratuitement
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )} */}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {<div style={{ color: "red" }}>{error.email}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    onChange={(e) => setpass(e.target.value)}
                                />
                                {<div style={{ color: "red" }}>{error.password}</div>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Se souvenir de moi
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link 
                                    to="/reset-password" 
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Se connecter
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou se connecter avec</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <div>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.91 15l.91-.69 1.65-2.38L16.7 13H9.3l2.05 2.09 2.69 3.91-.91-.69z"/>
                                    </svg>
                                    <span className="ml-2">Google</span>
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.91 15l.91-.69 1.65-2.38L16.7 13H9.3l2.05 2.09 2.69 3.91-.91-.69z"/>
                                    </svg>
                                    <span className="ml-2">Facebook</span>
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.91 15l.91-.69 1.65-2.38L16.7 13H9.3l2.05 2.09 2.69 3.91-.91-.69z"/>
                                    </svg>
                                    <span className="ml-2">Twitter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
