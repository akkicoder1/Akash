const Joi = require('joi');

const manualSendSchema = Joi.object({
  to: Joi.string().required(),
  text: Joi.string().min(1).required(),
  adminName: Joi.string().allow('', null)
});

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'agent').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const broadcastSchema = Joi.object({
  title: Joi.string().min(3).max(120).optional(),
  offerText: Joi.string().min(3).max(2000).optional(),
  productLinks: Joi.array().items(Joi.string().uri()).max(30).optional(),
  recipients: Joi.array().items(Joi.string().min(6)).max(5000).optional()
});

module.exports = {
  manualSendSchema,
  signupSchema,
  loginSchema,
  broadcastSchema
};
