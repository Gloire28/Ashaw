import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ConversationsPage from './pages/ConversationsPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/conversations" element={<ConversationsPage />} />
        <Route path="/produits" element={<ProductsPage />} />
        <Route path="/reservations" element={<BookingsPage />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
