import express from 'express';
import prisma from '../../utils/db.js';
import pteroApi from '../../utils/pteroApi.js';

const router = express.Router();

function generatePassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

async function resetUserPassword(pteroUserId) {
  const newPassword = generatePassword();

  const { data } = await pteroApi.get(`/users/${pteroUserId}`);
  const user = data.attributes;

  const payload = {
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    password: newPassword,
    password_confirmation: newPassword,
  };

  await pteroApi.patch(`/users/${pteroUserId}`, payload);
  console.log(`✅ Password updated for user ${pteroUserId}`);
  return newPassword;
}

router.post('/reset-password', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const user = await prisma.user.findUnique({ where: { discord_id: req.user.discord.id } });
    if (!user || !user.ptero_id) return res.status(404).json({ error: 'Pterodactyl user not found' });

    const newPassword = await resetUserPassword(user.ptero_id);
    res.json({ newPassword });
  } catch (err) {
    console.error('❌ Failed to reset password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
