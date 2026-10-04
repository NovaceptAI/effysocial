// Razorpay Standard Checkout's script, loaded only when someone pays (launch plan 6.6).
// The page's Content-Security-Policy allows this one origin (deploy/content-security-policy.conf).
export const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

let loading = null;

export function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = RAZORPAY_SCRIPT;
      s.async = true;
      s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('no Razorpay')));
      s.onerror = () => reject(new Error('script failed'));
      document.head.appendChild(s);
    }).catch((e) => { loading = null; throw e; });
  }
  return loading;
}
