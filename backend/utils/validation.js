const Joi = require('joi');

// Validación para login
const loginValidation = (data) => {
  const schema = Joi.object({
    usuario: Joi.string().min(3).max(50),
    nombre_usuario: Joi.string().min(3).max(50),
    password: Joi.string().min(6),
    contraseña: Joi.string().min(6)
  }).or('usuario', 'nombre_usuario').or('password', 'contraseña');
  return schema.validate(data);
};

// Validación para registro
const registerValidation = (data) => {
  const schema = Joi.object({
    usuario: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    nombre: Joi.string().min(2).max(100).required()
  });
  return schema.validate(data);
};

// Validación para cliente
const clienteValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(50).required(),
    direccion: Joi.string().max(200).allow('')
  });
  return schema.validate(data);
};

// Validación para producto
const productoValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    precio: Joi.number().min(0).required(),
    imagen: Joi.string().max(255).allow('')
  });
  return schema.validate(data);
};

// Validación para factura
const facturaValidation = (data) => {
  const schema = Joi.object({
    cliente_id: Joi.number().integer().required(),
    productos: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().required(),
        cantidad: Joi.number().integer().min(1).required(),
        precio: Joi.number().min(0).required()
      })
    ).min(1).required()
  });
  return schema.validate(data);
};

module.exports = {
  loginValidation,
  registerValidation,
  clienteValidation,
  productoValidation,
  facturaValidation
};