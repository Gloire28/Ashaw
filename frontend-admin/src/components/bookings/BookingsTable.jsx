import { bookingStatusLabels, bookingStatusBadge, formatDate } from '../../utils/formatTime.js';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const BookingsTable = ({ bookings, onStatusChange, onDelete }) => {
  if (bookings.length === 0) {
    return <p className="table__empty">Aucune réservation pour ces filtres.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Produit</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Durée</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                {booking.clientPseudo} · {booking.clientAge} ans
                {booking.clientContact && (
                  <div className="conv-list__last">{booking.clientContact}</div>
                )}
              </td>
              <td>{booking.product.name}</td>
              <td className="num">{formatDate(booking.date)}</td>
              <td className="num">{booking.startTime}</td>
              <td className="num">{booking.durationHours} h</td>
              <td>
                <select
                  value={booking.status}
                  onChange={(e) => onStatusChange(booking, e.target.value)}
                  className={`badge ${bookingStatusBadge[booking.status]}`}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {bookingStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button className="btn btn--danger btn--sm" onClick={() => onDelete(booking)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable;
