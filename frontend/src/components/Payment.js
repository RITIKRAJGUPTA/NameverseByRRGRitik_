import React from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Payment() {
  const handlePayment = async () => {
    // Instead of actual payment, show toast that it's coming soon
    toast.info('Donation feature is coming soon!', {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // If you still want to keep the real payment code for future use,
    // you can comment it out or keep it below:
    /*
    try {
      const { data } = await axios.post('https://ritiks-insight-hub-nameverse.onrender.com/api/payment/create-order', { amount: 5000 });
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Support Developer",
        description: "Donation",
        order_id: data.orderId,
        handler: (res) => {
          toast.success(`Payment successful: ${res.razorpay_payment_id}`, {
            position: "top-center",
            autoClose: 3000,
          });
        },
        prefill: {
          name: "Ritik Raj Gupta",
          email: "test@example.com",
          contact: "9999999999"
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Error starting payment', { position: "top-center" });
    }
    */
  };

  return (
    <div className="container mt-5 pt-5">
      <h2>Support the Developer</h2>
      <button className="btn btn-warning" onClick={handlePayment}>
        Donate ₹50 (Coming soon....)
      </button>

      {/* Toast container to show toasts */}
      <ToastContainer />
    </div>
  );
}
