import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import BookingsTable from '../components/bookings/BookingsTable.jsx';
import BookingFormModal from '../components/bookings/BookingFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import Loader from '../components/common/Loader.jsx';
import { bookingStatusLabels } from '../utils/formatTime.js';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const refresh = useCallback(async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) {
      params.from = dateFilter;
      params.to = dateFilter;
    }
    const { data } = await api.get('/api/bookings', { params });
    setBookings(data);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    api.get('/api/products/admin/all').then(({ data }) => setProducts(data));
  }, []);

  const handleStatusChange = async (booking, status) => {
    await api.patch(`/api/bookings/${booking.id}`, { status });
    refresh();
  };

  const handleDelete = async () => {
    await api.delete(`/api/bookings/${pendingDelete.id}`);
    setPendingDelete(null);
    refresh();
  };

  return (
    <>
      <div className="section-head">
        <h2>Réservations</h2>
        <button className="btn btn--accent" onClick={() => setFormOpen(true)}>
          + Nouvelle réservation
        </button>
      </div>

      <div className="filter-row">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(bookingStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        {(statusFilter || dateFilter) && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {loading ? (
        <Loader label="Chargement des réservations…" />
      ) : (
        <BookingsTable bookings={bookings} onStatusChange={handleStatusChange} onDelete={setPendingDelete} />
      )}

      {formOpen && (
        <BookingFormModal
          products={products}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            refresh();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer cette réservation ?"
          message={`La réservation de ${pendingDelete.clientPseudo} sera définitivement supprimée.`}
          confirmLabel="Supprimer"
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default BookingsPage;
