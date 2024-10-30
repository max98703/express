/* eslint no-undef: "off" */
/* eslint no-case-declarations: "off" */

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
const crypto = require('crypto');
const stripes = Stripe(process.env.STRIPE_SECRET_KEY);
const cron = require("node-cron");
const axios = require('axios');
const { upload } = require("../backend/db/db");

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

app.post('/uploada', upload, (req, res) => {
  console.log('Uploaded file:', req.file);
  if (req.file) {
    return res.status(200).send({ message: 'Image saved successfully', filename: req.file.filename });
  }
  return res.status(400).send('Image upload failed.');
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook endpoint
app.post('/feed/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature']; // GitHub's SHA-256 HMAC signature
  const secret="Zm3xN7sjkL1hZ0qJw3eD6Yb9Xp2P5lA8";
  const payload = req.body;
  // Verify signature
  const isVerified = verifySignature(payload, signature, secret);
  if (isVerified) {
    try {
      const data = req.body; // The payload from GitHub
      let response = {};

      // Handle pull request or issue data
      const pullRequest = data_get(data, 'pull_request') || data_get(data, 'repository');
      const htmlUrl = data_get(pullRequest, 'html_url')|| null;
      const body = `${data_get(data, 'comment.body') || data_get(pullRequest, 'body') || null} `;
      response['pull_request_id'] = pullRequest['id'];
      response['action'] =  data_get(data, 'action') || 'merged';
      response['pull_request_url'] = htmlUrl;
      response['pull_request_title'] = data_get(pullRequest, 'title') || null;
      response['pull_request_sender_username'] = data_get(data, 'comment.user.login') || data_get(pullRequest, 'user.login') || null;
      response['pull_request_sender_url'] = data_get(pullRequest, 'user.html_url') || null;
      response['pull_request_comment'] = body; 
      response['repository_full_name'] = data_get(pullRequest, 'merge_commit_sha') || null;

      const repository = data_get(data, 'repository');
      if (repository) {
        response['repository_name'] = data_get(repository, 'name');
        response['repository_url'] = data_get(repository, 'html_url');
      }

      const sender = data_get(data, 'sender');
      if (sender) {
        response['sender_username'] = data_get(sender, 'login');
        response['sender_url'] = data_get(sender, 'html_url');
      }

      console.log(response);

      res.status(200).json({ message: 'Webhook received and verified' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
});

// Signature verification function
function verifySignature(payload, signatureHeader, secret) {
  // Ensure payload is a string
  const payloadString = JSON.stringify(payload);

  // Separate the hash algorithm and the signature
  const [hashAlgo, signature] = signatureHeader.split('=');

  // Compute the HMAC signature
  const computedSignature = crypto
    .createHmac(hashAlgo, secret)
    .update(payloadString) // Use the stringified payload
    .digest('hex');

  // Verify that computed signature matches the received signature
  const isValid = crypto.timingSafeEqual(
    Buffer.from(computedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );

  return isValid;
}

function data_get(obj, path) {
  return path.split('.').reduce((o, key) => (o || {})[key], obj);
}

app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true  
}));

app.get('/pull-requests', async (req, res) => {
  const owner = "max98703";
  const repo = "express";
  const GITHUB_TOKEN= "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";
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching pull requests:', error.message);
    res.status(500).json({ error: 'Error fetching pull requests' });
  }
});
app.put('/merge', async (req, res) => {
  const owner = "max98703";
  const repo = "express";
  const { pr_number } = req.body; // Extract the pull request number from the request body

  const GITHUB_TOKEN = "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";

  try {
    // Make the PUT request to the GitHub API to merge the pull request
    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/merge`, 
      {
        commit_title: `Merged from express by ${pr_number}`, 
        merge_method: 'merge', // Correctly formatted
      }, 
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    console.log(response);
    res.status(200).json({
      message: "Pull request merged successfully",
      data: response.data,
    });
  } catch (error) {
    console.error('Error fetching pull requests:', error.message);
    // Check if the error response from GitHub contains a status code
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.message });
    }
    res.status(500).json({ error: 'Error fetching pull requests' });
  }
});


app.use(credentials);
//CORS middleware


// Mount auth and user routes
app.use('/', authRoutes);  
app.use(authenticateUser);
app.use('/', userRoutes); 
app.use('/',stripe);
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
