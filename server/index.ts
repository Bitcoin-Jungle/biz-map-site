import { buildApp } from './app';

const app = buildApp();
const port = Number.parseInt(process.env.PORT ?? '8080', 10);

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
