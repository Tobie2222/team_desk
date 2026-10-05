import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

config({ path: resolve(__dirname, '../../../../.env') });
const normalizedDir = __dirname.replace(/\\/g, '/');

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [normalizedDir + '/../**/*.entity{.ts,.js}'],
  migrations: [normalizedDir + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
});
