import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { setAdminCookie, clearCookie } from '../utils/cookieUtils.js';

export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, config.jwtSecret, {
      expiresIn: '7d',
    });

    setAdminCookie(res, token);
    res.json({ id: admin.id, username: admin.username });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (req, res) => {
  clearCookie(res, 'adminToken');
  res.status(204).send();
};

export const getMe = async (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
};
