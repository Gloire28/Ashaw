const Loader = ({ label }) => (
  <div className="page-state" role="status" aria-live="polite">
    <span className="loader" />
    {label && <p style={{ marginTop: '12px' }}>{label}</p>}
  </div>
);

export default Loader;