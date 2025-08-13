import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Payment() {
  const [amount, setAmount] = useState(50); // Default ₹50

  // ✅ Function to dynamically load Razorpay script
  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (amount < 10) {
      toast.error('Minimum donation amount is ₹10', {
        position: 'top-center'
      });
      return;
    }

    toast.info('Initializing payment...', {
      position: 'top-center',
      autoClose: 2000,
    });

    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?', {
        position: 'top-center'
      });
      return;
    }

    try {
      // ✅ Create order from backend (convert Rs to paisa)
      const { data } = await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/payment/create-order', { amount: amount * 100 });

      const options = {
        key: data.keyId,
        amount: data.amount.toString(),
        currency: data.currency,
        name: 'Support Developer',
        description: 'Donation',
        order_id: data.orderId,
        handler: function (response) {
          toast.success(`Payment successful: ${response.razorpay_payment_id}`, {
            position: 'top-center',
            autoClose: 3000
          });

          // ✅ Verify payment on backend
          axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/payment/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }).then(() => {
            console.log('Payment verified successfully!');
          }).catch(() => {
            toast.error('Payment verification failed', { position: 'top-center' });
          });
        },
        prefill: {
          name: 'Ritik Raj Gupta',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error('Error initiating payment', {
        position: 'top-center'
      });
    }
  };

  return (
    <div className="container mt-5 pt-5 text-center">
      <h2>Support the Developer</h2>
      
      <div className="mb-3">
        <input
          type="number"
          className="form-control w-25 mx-auto text-center"
          placeholder="Enter amount (min ₹10)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button className="btn btn-warning mb-3" onClick={handlePayment}>
        Donate ₹{amount}
      </button>

      <ToastContainer />
    </div>
  );
}
