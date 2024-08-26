
const { query } = require("../db");

class SessionRepository {
    async getSessionByDevice(userId, email, deviceInfo) {
       return await query(
        "SELECT id FROM session_events WHERE user_id = ? AND email = ? AND device_info = ?",
        [userId, email, deviceInfo]
      );
    }
  
    async createSession(userId, email, deviceInfo, location) {
      await query(
        "INSERT INTO session_events (user_id, email, device_info, location) VALUES (?, ?, ?, ?)",
        [userId, email, deviceInfo, location]
      );
    }
  }
  
  module.exports = SessionRepository;