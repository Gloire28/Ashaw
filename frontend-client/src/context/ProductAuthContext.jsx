import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const ProductAuthContext = createContext(null);

const TOKEN_KEY = 'product_token';
const PRODUCT_KEY = 'product_data';
const OWNER_KEY = 'owner_data';

export const ProductAuthProvider = ({ children }) => {
  const [product, setProduct] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const productData = localStorage.getItem(PRODUCT_KEY);
    const ownerData = localStorage.getItem(OWNER_KEY);
    if (token && productData && ownerData) {
      try {
        const parsedProduct = JSON.parse(productData);
        const parsedOwner = JSON.parse(ownerData);
        setProduct(parsedProduct);
        setOwner(parsedOwner);
        // Ajouter le token aux headers par défaut
        api.defaults.headers.common['X-Product-Token'] = token;
      } catch (e) {
        // Si erreur, on nettoie
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(PRODUCT_KEY);
        localStorage.removeItem(OWNER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Connexion
  const login = async (username, password) => {
    const response = await api.post('/api/product-auth/login', { username, password });
    const { token, owner, product } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(product));
    localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
    setProduct(product);
    setOwner(owner);
    api.defaults.headers.common['X-Product-Token'] = token;
    return response.data;
  };

  // Inscription (reçoit un FormData déjà préparé)
  const register = async (formData) => {
    const response = await api.post('/api/product-auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const { token, owner, product } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(product));
    localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
    setProduct(product);
    setOwner(owner);
    api.defaults.headers.common['X-Product-Token'] = token;
    return response.data;
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PRODUCT_KEY);
    localStorage.removeItem(OWNER_KEY);
    delete api.defaults.headers.common['X-Product-Token'];
    setProduct(null);
    setOwner(null);
  };

  const isAuthenticated = !!product && !!owner;

  return (
    <ProductAuthContext.Provider
      value={{
        product,
        owner,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </ProductAuthContext.Provider>
  );
};

export const useProductAuth = () => {
  const ctx = useContext(ProductAuthContext);
  if (!ctx) throw new Error('useProductAuth must be used within a ProductAuthProvider');
  return ctx;
};