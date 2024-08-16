const express = require('express');
const cors = require('cors');
const app = express();
const {logger} = require('./middleware/logEvents');
const credentials = require('./middleware/credentials');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const userRoutes = require('./routes/users');
const stripe = require('./routes/stripe');
const authenticateUser = require('./middleware/authenticateUser');
const { sendEmailWithReceipt} = require('./services/service');
const {checkExpiredSubscriptions} = require('./services/cronJobs')
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const stripes = Stripe(process.env.STRIPE_SECRET_KEY);
const cron = require("node-cron");

app.use(session({
  secret: 'Avdqead34@#43@#$', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } ,
}));

cron.schedule('*/5 * * * * *', async () => {
  await checkExpiredSubscriptions();
});

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async(req, res) => {
  const sig = req.headers['stripe-signature'];
  console.log(sig);
  const endpointSecret = 'whsec_rRybj9Ryr3Fmpdam9QSj4hnPeL3Ivpu5'; 
  let event;
  
  try {
  
    event = stripes.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.:', err);
    return res.status(400).send(`: ⚠️  Webhook signature verification failed.${err}`);
  }

  switch (event.type) {
    case 'payment_intent.created':
      console.log('PaymentIntent created  successfully!', event.data.object);
      break;
    case 'charge.updated':
      const paymentIntent =  event.data.object;
      await sendEmailWithReceipt(paymentIntent)
      .then(() => console.log('Receipt email sent successfully!'))
      .catch((err) => console.error('Error sending receipt email:', err));
      break;
    case 'payment_method.attached':
      console.log('PaymentMethod was attached to a Customer!', event.data.object);
      break
    default:
      console.log(`Unhandled event type, ${event.type}`);
  }

  res.json({ received: true });
});

// app.post("/pusher-webhook", (req, res) => {
//   const signature = req.get("x-pusher-signature");
//   console.log(req);
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.SECRET_KEY)
//     .update(req.rawBody)
//     .digest("hex");

//   if (signature !== expectedSignature) {
//     console.log("Invalid signature, rejecting.");
//     return res.sendStatus(401);
//   }

//   // Handle different types of events
//   const event = req.body.event;
//   switch (event) {
//     case "login_success":
//       console.log("User logged in successfully:", req.body.user);
//       break;
//     case "v1.PublishToUsersAttempt":
//       console.log("Publish to users attempt detected:", req.body);
//       break;
//     case "v1.UserNotificationAcknowledgement":
//       console.log("User notification acknowledged:", req.body);
//       break;
//     case "v1.UserNotificationOpen":
//       console.log("User notification opened:", req.body);
//       break;
//     default:
//       console.log("Unhandled event:", event);
//   }

//   res.sendStatus(200);
// });
app.use(logger);
app.use(credentials);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true  
}));

// Mount auth and user routes
app.use('/', authRoutes);  
app.use(authenticateUser);
app.use('/', userRoutes); 
app.use('/',stripe);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
