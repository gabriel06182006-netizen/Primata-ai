import express from 'express';
import Stripe from 'stripe';

const PORT = Number(process.env.API_PORT || 3001);

export const PLANS = [
  {
    id: 'plus',
    name: 'PLUS',
    price: 1990,
    currency: 'brl',
    interval: 'month',
    description: 'Para quem quer usar o Primata AI todos os dias.',
    features: [
      'Respostas ilimitadas',
      'Acesso a todos os modelos padrão',
      'Histórico de conversas',
      'Suporte por e-mail',
    ],
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 3000,
    currency: 'brl',
    interval: 'month',
    description: 'Máxima capacidade e prioridade em tudo.',
    features: [
      'Tudo do PLUS',
      'Modelos avançados',
      'Uso prioritário (fila dedicada)',
      'Suporte prioritário',
    ],
    highlighted: true,
  },
];

const app = express();
app.use(express.json());

app.get('/api/plans', (_req, res) => {
  res.json({ plans: PLANS });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/checkout', async (req, res) => {
  const plan = PLANS.find((item) => item.id === req.body?.planId);
  if (!plan) {
    return res.status(400).json({ error: 'Plano inválido.' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res
      .status(503)
      .json({ error: 'Pagamentos ainda não configurados. Adicione a chave do Stripe.' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const baseUrl =
      req.headers.origin || process.env.PUBLIC_APP_URL || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency,
            unit_amount: plan.price,
            recurring: { interval: plan.interval },
            product_data: { name: `Primata AI ${plan.name}` },
          },
        },
      ],
      success_url: `${baseUrl}/?status=sucesso`,
      cancel_url: `${baseUrl}/?status=cancelado`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Falha ao criar sessão de checkout:', error.message);
    res.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API de planos ouvindo na porta ${PORT}`);
});
