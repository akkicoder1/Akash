const app = require('./app');
const config = require('./config/env');
const { connectDatabase } = require('./config/database');

async function bootstrap() {
  await connectDatabase(config.mongoUri);
  app.listen(config.port, () => {
    console.log(`[server] listening on port ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[server] failed to start', error);
  process.exit(1);
});
