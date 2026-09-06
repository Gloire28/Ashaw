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

// Composant de protection des routes privées
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useProductAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => (
  <ProductAuthProvider>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/produit/:id" element={<ProductPage />} />
        <Route path="/register" element={<ProductRegister />} />
        <Route path="/login" element={<ProductLogin />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <ProductDashboard />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </ProductAuthProvider>
);

export default App;