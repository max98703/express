import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BsCreditCard } from 'react-icons/bs'; // Import a credit card icon

const stripePromise = loadStripe("pk_test_51PhAAeRp52W0EuJUpO89AH80TPZf2JL0J5RcoXUyxq0TqFybQwQVps7wvtzj2ySJoDKF61AbdYqAHCILagvBitfn00AJFDkJoG");

const PaymentProccess = () => {
  const location = useLocation();
  const { clientSecret, price } = location.state || {};
  console.log(clientSecret,price);
  if (!clientSecret) {
    return <div>Client secret is missing. Please try again.</div>;
  }

  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm price={price} />
    </Elements>
  );
};

const PaymentForm = ({ price }) => {
  const stripe = useStripe();
  const elements = useElements();

  // State for billing details
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
      setBillingDetails({ ...billingDetails, [name]: value });
    
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: billingDetails,
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      console.log('Payment Error:', error.message);
    } else {
      console.log(paymentIntent);
      console.log('Payment successful!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Secure Payment</h2>
        <div className="flex justify-center items-center mb-6">
          <BsCreditCard className="text-blue-500 text-3xl" />
          <p className="ml-2 text-lg font-medium text-gray-600">Complete Your Payment</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="  mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={billingDetails.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={billingDetails.email}
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
              required
            />
          </div>

          <PaymentElement className="mb-4" />
          <button
            type="submit"
            disabled={!stripe}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg mt-2 hover:from-blue-600 hover:to-purple-700 transition duration-300 font-semibold"
          >
            Pay Now - ${price}
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            By clicking "Pay Now", you agree to our <span className="text-blue-600 hover:underline">terms and conditions</span>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentProccess;
