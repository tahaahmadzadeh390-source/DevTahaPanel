import express from 'express';
import { getDB } from '../database/db.js';

const router = express.Router();

// Get Server Stats
router.get('/server', async (req, res) => {
  try {
    const db = await getDB();
    
    const stats = await db.get(
      'SELECT * FROM serverStats ORDER BY recordedAt DESC LIMIT 1'
    );

    if (!stats) {
      return res.json({
        totalConnections: 0,
        totalBandwidth: 0,
        activeConnections: 0,
        uptime: 0
      });
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get User Stats
router.get('/user', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDB();
    
    const stats = await db.get(
      `SELECT COUNT(*) as configCount, SUM(bandwidth) as totalBandwidth FROM configs WHERE userId = ?`,
      [userId]
    );

    res.json(stats || { configCount: 0, totalBandwidth: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
