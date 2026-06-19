export const startCheckout = async (userId: string, userEmail: string, annual: boolean) => {
  const priceId = annual
    ? process.env.REACT_APP_STRIPE_PRO_YEARLY_PRICE_ID!
    : process.env.REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID!;

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId, userEmail }),
  });

  const { url, error } = await res.json();
  if (error) throw new Error(error);
  window.location.href = url;
};
