import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { moderateRoutes } from './routes/moderate';
import { submissionRoutes } from './routes/submissions';
import { tokenRoutes } from './routes/token';

dotenv.config({ path: resolve(process.cwd(), '.env') });

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  });

  app.options('/api/*', async (_request, reply) => reply.code(204).send());

  void app.register(tokenRoutes);
  void app.register(submissionRoutes);
  void app.register(moderateRoutes);

  const distRoot = resolve(process.cwd(), 'dist');
  if (existsSync(distRoot)) {
    void app.register(fastifyStatic, {
      root: distRoot,
      prefix: '/',
      // Serve .br/.gz siblings produced at build time (scripts/precompress.mjs)
      // when the client accepts them — brotli at zero runtime cost.
      preCompressed: true,
      setHeaders: (res, pathName) => {
        if (pathName.includes('/assets/')) {
          // Vite content-hashed files: cache forever.
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (pathName.endsWith('.html')) {
          // index.html (and the SPA fallback) must always revalidate.
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          // fonts, logo, manifest, favicon (stable but unhashed): 1 day.
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      },
    });
  }

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.code(404).send({ error: 'Not found' });
    }

    const indexPath = join(distRoot, 'index.html');
    if (!existsSync(indexPath)) {
      return reply.code(404).send('SPA build not found. Run npm run build first.');
    }

    return reply.sendFile('index.html');
  });

  return app;
}
