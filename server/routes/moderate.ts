import type { FastifyInstance } from 'fastify';
import { getSubmission, setExternalId, setStatus, type Submission } from '../lib/db';
import { revokeSubmittedPlace, submitPlace } from '../lib/importRpc';
import type { AddPayload } from './submissions';

interface ModerateQuery {
  id?: string;
  key?: string;
}

function html(reply: { type: (contentType: string) => { send: (payload: string) => unknown } }, body: string): unknown {
  return reply.type('text/html; charset=utf-8').send(`<!doctype html><html><body>${body}</body></html>`);
}

function parseId(value: string | undefined): number | null {
  const id = Number.parseInt(value ?? '', 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function mapPayloadToPlace(payload: AddPayload): Record<string, unknown> {
  // BTC Map's submit_place schema may need tuning as the Import RPC settles.
  // Keep the BJ form fields intact in tags so no submitted context is lost.
  return {
    name: payload.name,
    lat: payload.coordinates.latitude,
    lon: payload.coordinates.longitude,
    tags: {
      categories: payload.categories,
      phone: payload.phone ?? '',
      website: payload.website ?? '',
      description: payload.description ?? '',
    },
  };
}

export async function resolveOwnership(_targetPlaceId: string): Promise<string | null> {
  // TODO: return the bitcoin-jungle external_id after BJ merchants are re-imported
  // with origin=bitcoin-jungle. Until then, BTC Map place ids cannot be reliably
  // mapped back to BJ-owned import external ids.
  return null;
}

async function approveAdd(submission: Submission<AddPayload>): Promise<string> {
  const extId = submission.btcmap_external_id ?? `sub:${submission.id}`;
  if (submission.status === 'approved' && submission.btcmap_external_id) {
    return 'Submission already approved.';
  }

  await submitPlace({
    external_id: extId,
    ...mapPayloadToPlace(submission.payload),
  });
  setExternalId(submission.id, extId);
  setStatus(submission.id, 'approved');
  return 'Submission approved.';
}

async function approveOwnedTarget(submission: Submission): Promise<string> {
  const targetPlaceId = submission.target_place_id;
  if (!targetPlaceId) {
    setStatus(submission.id, 'handled');
    return 'Noted &mdash; admin to action upstream.';
  }

  const externalId = await resolveOwnership(targetPlaceId);
  if (!externalId) {
    setStatus(submission.id, 'handled');
    return 'Noted &mdash; admin to action upstream.';
  }

  if (submission.status === 'approved') {
    return 'Submission already approved.';
  }

  if (submission.type === 'verify') {
    await submitPlace({ external_id: externalId, target_place_id: targetPlaceId });
  } else {
    await revokeSubmittedPlace(externalId);
  }

  setExternalId(submission.id, externalId);
  setStatus(submission.id, 'approved');
  return 'Submission approved.';
}

export async function moderateRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ModerateQuery }>('/api/reject', async (request, reply) => {
    if (request.query.key !== process.env.APPROVE_KEY) {
      return reply.code(403).send({ error: 'Invalid key' });
    }

    const id = parseId(request.query.id);
    if (!id) {
      return reply.code(400).send({ error: 'ID is required' });
    }

    const submission = getSubmission(id);
    if (!submission) {
      return reply.code(404).send({ error: 'Submission not found' });
    }

    setStatus(id, 'rejected');
    return html(reply, 'Submission rejected.');
  });

  app.get<{ Querystring: ModerateQuery }>('/api/approve', async (request, reply) => {
    if (request.query.key !== process.env.APPROVE_KEY) {
      return reply.code(403).send({ error: 'Invalid key' });
    }

    const id = parseId(request.query.id);
    if (!id) {
      return reply.code(400).send({ error: 'ID is required' });
    }

    const submission = getSubmission(id);
    if (!submission) {
      return reply.code(404).send({ error: 'Submission not found' });
    }

    try {
      const message =
        submission.type === 'add'
          ? await approveAdd(submission as Submission<AddPayload>)
          : await approveOwnedTarget(submission);

      return html(reply, message);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error instanceof Error ? error.message : 'Approval failed' });
    }
  });
}
