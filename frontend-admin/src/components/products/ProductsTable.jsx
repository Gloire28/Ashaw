import { formatPrice } from '../../utils/formatTime.js';

const ProductsTable = ({ products, onEdit, onToggle, onDelete }) => {
  if (products.length === 0) {
    return <p className="table__empty">Aucun produit pour le moment. Ajoute le premier.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Prix / heure</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="table__product">
                  <img className="table__thumb" src={product.mainPhotoUrl} alt="" />
                  {product.name}
                </div>
              </td>
              <td>{product.category}</td>
              <td className="num">{formatPrice(product.pricePerHour)} FCFA</td>
              <td>
                <span className={`badge ${product.isActive ? 'badge--confirm' : 'badge--neutral'}`}>
                  {product.isActive ? 'Actif' : 'Désactivé'}
                </span>
              </td>
              <td>
                <div className="table__actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => onEdit(product)}>
                    Modifier
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => onToggle(product)}>
                    {product.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => onDelete(product)}>
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
