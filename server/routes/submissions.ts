import type { FastifyInstance } from 'fastify';
import { insertSubmission } from '../lib/db';
import { sendApprovalEmail } from '../lib/mail';

interface AddPayload {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  categories: Array<string | number>;
  phone?: string;
  website?: string;
  description?: string;
}

interface TargetPayload {
  target_place_id: string;
  description?: string;
  /** verify only: true = "still accepts bitcoin", false = "details outdated/wrong" */
  current?: boolean;
  /** verify only: free-text explanation when current === false */
  outdated?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseCoordinate(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function validateAdd(body: unknown): AddPayload {
  if (!isRecord(body)) {
    throw new Error('POST Body must be JSON');
  }

  const name = String(body.name ?? '').trim();
  if (!name) {
    throw new Error('Name is required');
  }

  const coordinates = isRecord(body.coordinates) ? body.coordinates : {};
  const latitude = parseCoordinate(coordinates.latitude);
  if (latitude === null || latitude < -90 || latitude > 90) {
    throw new Error('Invalid Latitude Coordinates');
  }

  const longitude = parseCoordinate(coordinates.longitude);
  if (longitude === null || longitude < -180 || longitude > 180) {
    throw new Error('Invalid Longitude Coordinates');
  }

  const categories = Array.isArray(body.categories) ? body.categories : [];
  if (categories.length < 1) {
    throw new Error('At least one category is required');
  }

  return {
    name,
    coordinates: { latitude, longitude },
    categories: categories.map((category) => (typeof category === 'number' ? category : String(category))),
    phone: body.phone ? String(body.phone) : undefined,
    website: body.website ? String(body.website) : undefined,
    description: body.description ? String(body.description) : undefined,
  };
}

function validateTarget(body: unknown, requireDescription: boolean): TargetPayload {
  if (!isRecord(body)) {
    throw new Error('POST Body must be JSON');
  }

  const targetPlaceId = String(body.target_place_id ?? body.id ?? '').trim();
  if (!targetPlaceId) {
    throw new Error('target_place_id is required');
  }

  const description = body.description ? String(body.description).trim() : '';
  if (requireDescription && !description) {
    throw new Error('Report description is required');
  }

  // verify-only fields: the "still accepts?" answer and the outdated explanation.
  // Harmless for report (the client doesn't send them).
  const current = typeof body.current === 'boolean' ? body.current : undefined;
  const outdated = body.outdated ? String(body.outdated).trim() : undefined;

  return {
    target_place_id: targetPlaceId,
    description: description || undefined,
    current,
    outdated: outdated || undefined,
  };
}

export async function submissionRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/submit', async (request, reply) => {
    try {
      const payload = validateAdd(request.body);
      const submission = insertSubmission('add', payload);
      await sendApprovalEmail(submission);
      return { success: true, id: submission.id };
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'Invalid submission' });
    }
  });

  app.post('/api/verify', async (request, reply) => {
    try {
      const payload = validateTarget(request.body, false);
      const submission = insertSubmission('verify', payload, payload.target_place_id);
      await sendApprovalEmail(submission);
      return { success: true, id: submission.id };
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'Invalid verification' });
    }
  });

  app.post('/api/report', async (request, reply) => {
    try {
      const payload = validateTarget(request.body, true);
      const submission = insertSubmission('report', payload, payload.target_place_id);
      await sendApprovalEmail(submission);
      return { success: true, id: submission.id };
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'Invalid report' });
    }
  });
}

export type { AddPayload, TargetPayload };
