export default function PlanCard({
  name,
  price,
  description,
  features = [],
  highlighted = false,
  loading = false,
  disabled = false,
  onSubscribe,
}) {
  return (
    <article className={`card${highlighted ? ' card--highlighted' : ''}`}>
      {highlighted && <span className="card__tag">Mais escolhido</span>}
      <h2>{name}</h2>
      <p className="card__price">
        {price}
        <span>/mês</span>
      </p>
      <p className="card__description">{description}</p>
      <ul className="card__features">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" onClick={onSubscribe} disabled={disabled}>
        {loading ? 'Abrindo pagamento…' : `Assinar ${name}`}
      </button>
    </article>
  );
}
