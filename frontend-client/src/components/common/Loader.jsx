const Loader = ({ label }) => (
  <div className="page-state">
    <span className="loader" />
    {label && <p style={{ marginTop: '12px' }}>{label}</p>}
  </div>
);

export default Loader;
