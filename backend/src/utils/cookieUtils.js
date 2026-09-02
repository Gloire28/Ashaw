// Client et Admin sont sur des domaines Netlify différents de l'API :
// un cookie cross-site exige sameSite "none" + secure (donc HTTPS) en prod.
// En local (http://localhost), on repasse en "lax" sans secure.
const isProd = process.env.NODE_ENV === 'production';
const crossSiteCookieOptions = {
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
};

export const setSessionCookie = (res, sessionId, hours) => {
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    ...crossSiteCookieOptions,
    maxAge: hours * 60 * 60 * 1000,
  });
};

export const setAdminCookie = (res, token) => {
  res.cookie('adminToken', token, {
    httpOnly: true,
    ...crossSiteCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name);
};
