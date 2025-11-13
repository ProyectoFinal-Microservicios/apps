import { exec } from 'child_process';
import { promisify } from 'util';
import logger from './logger.js';

const execAsync = promisify(exec);
/**
 *     environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
      - DB_SCHEMA=auth
 * 
 */
export async function waitForDatabase() {
    const {
        DB_USER,
        DB_PASS,
        DB_NAME,
        DB_HOST = 'db',
        DB_PORT = '5432'
    } = process.env;

    const host = process.argv[2] || DB_HOST;
    const port = process.argv[3] || DB_PORT;

    logger.info(`Waiting for database at ${host}:${port}...`);

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
        try {
            await execAsync(
                `PGPASSWORD=${DB_PASS} psql -h ${host} -p ${port} -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;"`,
                { timeout: 5000 }
            );
            logger.info('PostgreSQL is up - starting application');
            return true;
        } catch (error) {
            attempts++;
            logger.info(`PostgreSQL is unavailable (attempt ${attempts}/${maxAttempts}) - sleeping`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error(`Database not available after ${maxAttempts} attempts`);
}
