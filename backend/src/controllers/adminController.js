import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/index.js';

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

    // Le token est renvoyé dans le corps de la réponse (plus de cookie
    // cross-site, bloqué par défaut sur Safari/iOS) : le frontend le stocke
    // et le renvoie lui-même en "Authorization: Bearer <token>".
    res.json({ id: admin.id, username: admin.username, token });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (req, res) => {
  res.status(204).send();
};

export const getMe = async (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
};
