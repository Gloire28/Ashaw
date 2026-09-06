import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductAuthProvider, useProductAuth } from './context/ProductAuthContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductPage from './pages/ProductPage.jsx';
import NotFound from './pages/NotFound.jsx';
import ProductRegister from './pages/ProductRegister.jsx';
import ProductLogin from './pages/ProductLogin.jsx';
import ProductDashboard from './pages/ProductDashboard.jsx';

// Route privée : redirige vers /login si non authentifié
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useProductAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Route publique : redirige vers /dashboard si déjà authentifié
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useProductAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const App = () => (
  <ProductAuthProvider>
    <Navbar />
    <main>
      <Routes>
        {/* Page d'accueil : redirige vers dashboard si connecté */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <ProductRegister />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <ProductLogin />
            </PublicRoute>
          }
        />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/produit/:id" element={<ProductPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ProductDashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </ProductAuthProvider>
);

export default App;