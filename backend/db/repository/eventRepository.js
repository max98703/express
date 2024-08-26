const { query } = require("../db");

class EventRepository {
    async logEvent(userId, username, email, location) {
      await query(
        "INSERT INTO userLog (user_id, username, email, location) VALUES (?, ?, ?, ?)",
        [userId, username, email, location]
      );
    }
  }
  
  module.exports = EventRepository;