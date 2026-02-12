import { apiJson } from './apiClient';

export type PaymentProvider = 'razorpay';

export type CheckoutResponse = { provider: 'razorpay'; order: { id: string; amount: number; currency: string }; keyId: string };

export async function createCheckout(planKey: string) {
  return apiJson<CheckoutResponse>('/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ planKey }),
  });
}

export async function confirmRazorpay(payload: { orderId: string; paymentId: string; signature: string }) {
  return apiJson<{ success: boolean; purchase: any }>('/api/payments/razorpay/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
