
const { query } = require("../db");

class UserRepository {
  async getUserByEmail(email) {
    const [user] = await query("SELECT * FROM users WHERE email = ?", [email]);
    return user;
  }

  async getUserByGoogleId(id) {
    const [user] = await query("SELECT * FROM users WHERE id = ?", [id]);
    return user;
  }

  async getUserByEmails(email) {
    const [user] = await query("SELECT * FROM users WHERE email = ? AND (googleLogin IS NULL OR googleLogin = 0)", [email]);
    return user;
  }

  async getUserLogs(id) {
    const rows = await query(
      "SELECT user_id, username, email, location, created_at FROM userlog WHERE user_id = ?",
      [id]
    );
    return rows;
  }

  async updateUser(userData, token) {
    return query("UPDATE users SET name = ?, token = ? WHERE id = ?", [
      userData.name,
      token,
      userData.id,
    ]);
  }

  async insertUser(userData, token) {
    return query(
      "INSERT INTO users (id, email, name, logo, token, googleLogin) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userData.id,
        userData.email,
        userData.name,
        userData.picture,
        token,
        userData.googleLogin,
      ]
    );
  }

  async updateUserDetails(updates, userId) {
    const updateFields = Object.entries(updates).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc.sql.push(`${key} = ?`);
          acc.params.push(value);
        }
        return acc;
      },
      { sql: [], params: [] }
    );

    if (updateFields.sql.length) {
      const updateSql = `UPDATE users SET ${updateFields.sql.join(", ")} WHERE id = ?`;
      await query(updateSql, [...updateFields.params, userId]);
    }
  }

  async updateProfilePicture(userId, filename) {
    await query("UPDATE users SET logo = ? WHERE id = ?", [filename, userId]);
  }
}

module.exports = UserRepository;
