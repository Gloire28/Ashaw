import { Link } from 'react-router-dom';
import { useProductAuth } from '../context/ProductAuthContext.jsx';

const steps = [
  {
    title: 'Tu regardes',
    text: "Photos, vidéo, prix à l'heure : tout est sur la fiche du produit.",
  },
  {
    title: 'Tu contactes',
    text: "Si tu es connecté en tant que produit (F ou N), tu peux contacter les propriétaires de la catégorie opposée.",
  },
  {
    title: 'Vous vous accordez',
    text: "L'administrateur met en relation et vous permet de discuter pour finaliser la location.",
  },
];

const Home = () => {
  const { isAuthenticated } = useProductAuth();

  return (
    <>
      <section className="container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <h1 style={{ maxWidth: '14ch' }}>
          {isAuthenticated ? 'Bienvenue sur votre espace produit !' : 'Loue et propose tes services à l\'heure.'}
        </h1>
        <p style={{ fontSize: '1.05rem', marginBottom: '32px' }}>
          {isAuthenticated
            ? 'Accédez à votre tableau de bord pour gérer votre produit et vos discussions.'
            : 'Créez votre compte produit (catégorie F ou N), découvrez les offres de la catégorie opposée, et discutez directement.'}
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/boutique" className="btn btn--accent">
            Voir la boutique
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn--outline">
              Créer mon compte produit
            </Link>
          )}
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '64px' }}>
        <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', listStyle: 'none', padding: 0, counterReset: 'step' }}>
          {steps.map((step, index) => (
            <li key={step.title} style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-ink)', fontSize: '1.4rem', marginBottom: '8px' }}>
                {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
};

export default Home;