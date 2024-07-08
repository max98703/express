const crypto = require('crypto');
const { app, query, transporter } = require('./db');
const { generateEmailContent } = require('../src/components/Email/Email');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendLoginEmail(user) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'max.c@shikhartech.com',
    subject: 'Login Notification',
    html: generateEmailContent(user),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.log(error);
    console.error('Error sending email:', error);
  }
}

app.post('/login', async (req, res) => {
  const userData = req.body;
  const newUser = [
    userData.id,
    userData.email,
    userData.name,
    userData.picture,
  ];

  try {
    const checkSql = 'SELECT * FROM customers WHERE contact_email = ?';
    const [existingUser] = await query(checkSql, [userData.email]);

    if (existingUser) {
      req.session.user = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.contact_email,
        token: existingUser.remember_token,
      };
    } else {
      const token = generateToken();
      const insertSql = 'INSERT INTO customers (id, contact_email, name, logo, remember_token) VALUES (?, ?, ?, ?, ?)';
      const [results] = await query(insertSql, [...newUser, token]);

      if (!results) {
        console.error('Failed to insert new user');
        return res.status(401).json({ error: 'Failed to insert new user' });
      }

      req.session.user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        token: token,
      };
    }

    await sendLoginEmail(newUser);

    return res.status(200).json({
      message: 'Login successful and email sent',
      user: req.session.user,
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/checkTokenValidity', async (req, res) => {
  const { token } = req.body;
  try {
    const sql = 'SELECT * FROM customers WHERE remember_token = ?';
    const results = await query(sql, [token]);

    if (results.length > 0) {
      res.status(200).json({ valid: true });
    } else {
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error during token validation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
