import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'
// Subscription plan details
const subscriptionPlans = [
  {
    id: "mobile",
    title: "Mobile",
    price: "300",
    benefits: {
      hd: false,
      ultraHd: false,
      screens: 1,
      watchOnMobile: true,
    },
  },
  {
    id: "standard",
    title: "Standard",
    price: "700",
    benefits: {
      hd: true,
      ultraHd: false,
      screens: 2,
      watchOnMobile: true,
    },
  },
  {
    id: "premium",
    title: "Premium",
    price: "1200",
    benefits: {
      hd: true,
      ultraHd: true,
      screens: 4,
      watchOnMobile: true,
    },
  },
];

// Main Payment Component
const Payment = () => {
  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[0]);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    try {
      const { data: { clientSecret } } = await api.post('/create-payment-intent', {
        title: selectedPlan.title,
        price: selectedPlan.price,
      });
      clientSecret 
        ? navigate('/paymentproccess', { state: { clientSecret, price: selectedPlan.price } }) 
        : console.log('Failed to retrieve client secret');
    } catch (error) {
      console.error('Error:', error.message || 'Unknown error occurred');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 mt-14 mb-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
        Choose a plan that's right for you.
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Downgrade or upgrade at any time
      </p>

      <div className="w-full max-w-4xl mb-8 overflow-x-auto">
        {/* Plan Selection */}
        <div className="flex justify-center space-x-4 mb-6">
          {subscriptionPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`px-4 py-2 rounded-lg font-semibold text-lg ${
                selectedPlan.id === plan.id
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-600"
              } transition-all duration-300 ease-in-out`}
            >
              {plan.title}
            </button>
          ))}
        </div>

        {/* Pricing Details */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left border-b border-gray-300"></th>
                {subscriptionPlans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`py-2 px-4 text-center border-b border-gray-300 ${
                      selectedPlan.id === plan.id
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {plan.price}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 text-left border-b border-gray-300">
                  HD available
                </td>
                {subscriptionPlans.map((plan) => (
                  <td
                    key={plan.id}
                    className="py-3 px-4 text-center border-b border-gray-300"
                  >
                    {plan.benefits.hd ? (
                      <span className="text-green-500">&#10003;</span>
                    ) : (
                      <span className="text-red-500">&#10007;</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-left border-b border-gray-300">
                  Ultra HD available
                </td>
                {subscriptionPlans.map((plan) => (
                  <td
                    key={plan.id}
                    className="py-3 px-4 text-center border-b border-gray-300"
                  >
                    {plan.benefits.ultraHd ? (
                      <span className="text-green-500">&#10003;</span>
                    ) : (
                      <span className="text-red-500">&#10007;</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-left border-b border-gray-300">
                  Screens you can watch on at the same time
                </td>
                {subscriptionPlans.map((plan) => (
                  <td
                    key={plan.id}
                    className="py-3 px-4 text-center border-b border-gray-300"
                  >
                    {plan.benefits.screens}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-left border-b border-gray-300">
                  Watch on your mobile phone and tablet
                </td>
                {subscriptionPlans.map((plan) => (
                  <td
                    key={plan.id}
                    className="py-3 px-4 text-center border-b border-gray-300"
                  >
                    {plan.benefits.watchOnMobile ? (
                      <span className="text-green-500">&#10003;</span>
                    ) : (
                      <span className="text-red-500">&#10007;</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full transition-transform duration-300 transform hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          You've selected: <span className="text-red-600 text-xl font-bold">{selectedPlan.title}</span>
        </h3>
        <p className="text-center text-gray-700 mb-6 text-lg">
          Price: <span className="font-bold text-xl">{selectedPlan.price}</span>
        </p>
        <button 
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          Continue
        </button>
      </div>
    </div>
  );
};

export default Payment;
