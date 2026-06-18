import express from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../database/db.js';

const router = express.Router();

// Get Current User
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDB();
    
    const user = await db.get(
      'SELECT id, username, email, role, createdAt FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Password
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const db = await getDB();

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password required' });
    }

    const user = await db.get('SELECT password FROM users WHERE id = ?', [userId]);
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
