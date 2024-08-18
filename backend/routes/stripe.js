/* eslint no-undef: "off" */

const express = require('express');
const Stripe = require('stripe');
const { APIError, STATUS_CODES } = require('../utils/app-errors');

class PaymentController {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/create-payment-intent', this.createPaymentIntent.bind(this));
    this.router.get('/retrieve-subscription/:paymentIntentId', this.retrieveSubscription.bind(this));
    this.router.post('/create-payment-method', this.createPaymentMethod.bind(this));
  }

  async createPaymentIntent(req, res) {
    try {
      const { title, price } = req.body;
      console.log(price);

      let customer = await this.stripe.customers.list({
        email: req.user.email,
        limit: 1,
      });

      if (customer.data.length > 0) {
        customer = customer.data[0];
      } else {
        customer = await this.stripe.customers.create({
          email: req.user.email,
          name: req.user.name,
        });
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: price,
        currency: 'USD',
        customer: customer.id,
        payment_method_types: ['card'],
        metadata: { user_id: req.user.id },
        description: `Subscription plan: ${title}`,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });

    } catch (error) {
      throw new APIError('Error creating payment intent:', STATUS_CODES.BAD_REQUEST, error);
    }
  }

  async retrieveSubscription(req, res) {
    const { paymentIntentId } = req.params;

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        return res.status(404).json({ error: 'No customer associated with this payment intent' });
      }

      res.json({ stripeSubscriptionId: paymentIntent });
    } catch (error) {
      throw new APIError('Error retrieving subscription:', error);
    }
  }

  async createPaymentMethod(req, res) {
    const { cardNumber, expMonth, expYear, cvc } = req.body;

    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
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
      throw new APIError('Error creating payment method:', error);
    }
  }
}

module.exports = new PaymentController().router;