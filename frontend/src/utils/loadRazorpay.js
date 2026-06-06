const SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayPromise = null;

export default function loadRazorpay() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${SRC}"]`);

    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => {
        razorpayPromise = null;
        resolve(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return razorpayPromise;
}
