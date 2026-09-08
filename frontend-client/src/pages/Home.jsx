import { Link } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';

const steps = [
  {
    title: 'Tu regardes',
    text: "Photos, vidéo.",
  },
  {
    title: 'Tu contactes',
    text: "Si tu es connecté, tu peux contacter pour un match très rapide.",
  },
  {
    title: 'Apres le Match',
    text: "L'administrateur facilite et sécurise le match. Tu peux ensuite profiter de ton match.",
  },
];

const Home = () => {
  const { isAuthenticated } = useProductAuth();

  return (
    <div className="container">
      <section style={{ paddingTop: 'clamp(2rem, 5vw, 4rem)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <h1 style={{ maxWidth: '16ch', marginBottom: 'var(--space-3)' }}>
          {isAuthenticated ? 'Bienvenue sur votre Profil !' : "Trouve un match en 3 clics."}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--ink-soft)', maxWidth: '55ch', marginBottom: 'var(--space-4)' }}>
          {isAuthenticated
            ? 'Accédez à votre tableau de bord pour gérer vos matches.'
            : 'Créez votre compte et trouvez un match.'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Link to="/boutique" className="btn btn--accent">
            Voir les Matchs
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn--ghost">
              Créer mon compte
            </Link>
          )}
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <ol style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-4)', 
          listStyle: 'none', 
          padding: 0, 
          margin: 0 
        }}>
          {steps.map((step, index) => (
            <li key={step.title} style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--space-3)' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-ink)', fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>
                0{index + 1}
              </div>
              <h3 style={{ marginBottom: 'var(--space-1)' }}>{step.title}</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', margin: 0 }}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default Home;