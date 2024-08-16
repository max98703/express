const { query } = require("../db/db");
const { sendLoginEmail } = require("./service");

const getExpiredUsers = () => query("SELECT email FROM users WHERE is_expired = '1'");

const getSentEmails = async () => {
    const results = await query("SELECT email FROM sent_emails");
    return new Set(results.map(row => row.email));
};

const recordSentEmail = email => query("INSERT INTO sent_emails (email) VALUES (?) ON DUPLICATE KEY UPDATE sent_at = NOW()", [email]);

const BATCH_SIZE = 50;

const processBatch = async (emails) => {
    await Promise.all(emails.map(async email => {
        await sendLoginEmail(email, '1');
        await recordSentEmail(email);
    }));
};

const checkExpiredSubscriptions = async () => {
    const [users, sentEmails] = await Promise.all([getExpiredUsers(), getSentEmails()]);
    const expiredSubscriptions = users
        .map(user => user.email)
        .filter(email => !sentEmails.has(email));

    for (let i = 0; i < expiredSubscriptions.length; i += BATCH_SIZE) {
        const batch = expiredSubscriptions.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
    }
};

module.exports = { checkExpiredSubscriptions };
