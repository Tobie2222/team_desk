import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  MONGO_USER: Joi.string().required(),
  MONGO_PASSWORD: Joi.string().required(),
  MONGO_DATABASE: Joi.string().required(),
  MONGO_HOST: Joi.string().required(),
  MONGO_PORT: Joi.number().required(),
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().required(),
  MYSQL_ROOT_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
});
