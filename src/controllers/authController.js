const { signup, login, me } = require('../services/authService');
const { signupSchema, loginSchema } = require('../utils/validators');

async function signupHandler(req, res, next) {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const data = await signup(value);
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function loginHandler(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const data = await login(value);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

async function meHandler(req, res, next) {
  try {
    const data = await me(req.auth.sub);
    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  signupHandler,
  loginHandler,
  meHandler
};
