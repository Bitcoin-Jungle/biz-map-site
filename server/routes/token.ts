import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

export async function tokenRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/token', async (_request, reply) => {
    const origin = process.env.SITE_ORIGIN;
    const rawKey = process.env.APPLE_MAPS_KEY;
    const keyid = process.env.MAPS_KEY_ID;
    const issuer = process.env.APPLE_TEAM_ID;

    if (!rawKey || !keyid || !issuer) {
      return reply.code(500).send({ error: 'Apple MapKit signing env is not configured' });
    }

    const privatekey = rawKey.replace(/\\n/gm, '\n');
    const token = jwt.sign(
      {
        origin,
      },
      privatekey,
      {
        algorithm: 'ES256',
        expiresIn: '1d',
        keyid,
        issuer,
      },
    );

    return reply.type('text/plain').send(token);
  });
}
