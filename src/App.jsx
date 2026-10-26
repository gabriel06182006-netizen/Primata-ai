import { useEffect, useState } from 'react';
import PlanCard from './components/PlanCard.jsx';

const formatPrice = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function App() {
  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const status = new URLSearchParams(window.location.search).get('status');

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || []))
      .catch(() => setError('Não foi possível carregar os planos.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planId) {
    setError('');
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message);
      setLoadingPlan(null);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="badge">Primata AI</span>
        <h1>Escolha seu plano</h1>
        <p>Acesso pago com cobrança mensal recorrente. Cancele quando quiser.</p>
      </header>

      {status === 'sucesso' && <p className="notice success">Assinatura confirmada. Obrigado!</p>}
      {status === 'cancelado' && <p className="notice">Pagamento cancelado.</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="plans">
        {loading && <p className="loading">Carregando planos…</p>}
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            price={formatPrice(plan.price)}
            description={plan.description}
            features={plan.features}
            highlighted={plan.highlighted}
            loading={loadingPlan === plan.id}
            disabled={Boolean(loadingPlan)}
            onSubscribe={() => handleSubscribe(plan.id)}
          />
        ))}
      </section>

      <footer className="footnote">Pagamentos processados pelo Stripe.</footer>
    </div>
  );
}
