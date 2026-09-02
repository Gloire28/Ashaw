import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import ProductsTable from '../components/products/ProductsTable.jsx';
import ProductFormModal from '../components/products/ProductFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Loader from '../components/common/Loader.jsx';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/api/products/admin/all');
    setProducts(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleToggle = async (product) => {
    await api.patch(`/api/products/${product.id}/toggle`);
    refresh();
  };

  const handleDelete = async () => {
    await api.delete(`/api/products/${pendingDelete.id}`);
    setPendingDelete(null);
    refresh();
  };

  return (
    <>
      <div className="section-head">
        <h2>Produits</h2>
        <button
          className="btn btn--accent"
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
        >
          + Nouveau produit
        </button>
      </div>

      {loading ? (
        <Loader label="Chargement des produits…" />
      ) : (
        <ProductsTable
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setFormOpen(true);
          }}
          onToggle={handleToggle}
          onDelete={setPendingDelete}
        />
      )}

      {formOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            refresh();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer ce produit ?"
          message={`« ${pendingDelete.name} » sera définitivement supprimé.`}
          confirmLabel="Supprimer"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default ProductsPage;
