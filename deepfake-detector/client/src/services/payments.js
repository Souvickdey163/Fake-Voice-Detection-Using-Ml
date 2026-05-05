import api from './api';

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayLoader;

function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayLoader) {
    return razorpayLoader;
  }

  razorpayLoader = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SDK_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayLoader;
}

export async function startPlanCheckout({ plan, onSuccess }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Razorpay checkout failed to load. Check your connection and try again.');
  }

  const { data: order } = await api.post('/api/payments/create-order', { plan });

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: 'NeuroVoice',
      description: order.description,
      order_id: order.order_id,
      prefill: order.prefill,
      theme: {
        color: '#3b82f6',
      },
      handler: async (response) => {
        try {
          const { data } = await api.post('/api/payments/verify', {
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (onSuccess) {
            await onSuccess(data);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment popup closed before completion.')),
      },
    });

    razorpay.open();
  });
}
