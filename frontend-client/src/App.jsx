import { Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import StartChatModal from './components/chat/StartChatModal.jsx';
import ChatWindow from './components/chat/ChatWindow.jsx';
import FloatingConversations from './components/chat/FloatingConversations.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductPage from './pages/ProductPage.jsx';
import NotFound from './pages/NotFound.jsx';

const App = () => (
  <ChatProvider>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/produit/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />

    <StartChatModal />
    <ChatWindow />
    <FloatingConversations />
  </ChatProvider>
);

export default App;
