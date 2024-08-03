const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res) => {
    try {
      const { title, price } = req.body;
      console.log(price)
      let customer = await stripe.customers.list({
        email: req.user.email,
        limit: 1,
      });
  
      if (customer.data.length > 0) {
        customer = customer.data[0];
      } else {
        customer = await stripe.customers.create({
          email:req.user.email,
          name:req.user.name,
        });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'USD',
        customer:customer.id, 
        payment_method_types: ['card'],
        metadata: { user_id: req.user.id },
        description: `Subscription plan: ${title}`,
      });
  
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
  
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error:error });
    }
  });
  

  router.get('/retrieve-subscription/:paymentIntentId', async (req, res) => {
    const { paymentIntentId } = req.params;
  
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (!paymentIntent) {
        return res.status(404).json({ error: 'No customer associated with this payment intent' });
      }
  
    //const subscription = customer.subscriptions.data[0]; // Assuming one subscription
      res.json({ stripeSubscriptionId: paymentIntent });
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      res.status(500).json({ error: 'Failed to retrieve subscription' });
    }
  });


router.post('/create-payment-method', async (req, res) => {
    const { cardNumber, expMonth, expYear, cvc } = req.body;
  
    try {
      // Create a payment method with the provided card details
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc,
        },
      });
  
      res.json({
        paymentMethodId: paymentMethod.id,
        cardBrand: paymentMethod.card.brand,
        cardCountry: paymentMethod.card.country,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(500).json({ error: error });
    }
  });
 
  
  module.exports = router