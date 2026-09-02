import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Tu regardes',
    text: "Photos, vidéo, prix à l'heure : tout est sur la fiche du produit, sans créer de compte.",
  },
  {
    title: 'Tu discutes',
    text: "Un pseudo, un âge, et tu es en contact direct avec le vendeur pour poser tes questions.",
  },
  {
    title: 'Vous vous accordez',
    text: "Le vendeur te propose un créneau. Une fois d'accord, la réservation est enregistrée.",
  },
];

const Home = () => (
  <>
    <section className="container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
      <h1 style={{ maxWidth: '14ch' }}>Loue ce dont tu as besoin, à l'heure près.</h1>
      <p style={{ fontSize: '1.05rem', marginBottom: '32px' }}>
        Parcours le catalogue, discute directement avec le vendeur, et fixez ensemble le
        créneau de location. Pas de compte à créer.
      </p>
      <Link to="/boutique" className="btn btn--accent">
        Voir la boutique
      </Link>
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

export default Home;
