import sgMail from '@sendgrid/mail';
import type { Submission } from './db';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function detailsList(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return `<li>Payload: ${escapeHtml(JSON.stringify(payload))}</li>`;
  }

  return Object.entries(payload)
    .map(([key, value]) => `<li>${escapeHtml(key)}: ${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</li>`)
    .join('');
}

export async function sendApprovalEmail(submission: Submission): Promise<void> {
  const publicUrl = process.env.PUBLIC_URL ?? 'http://localhost:8080';
  const approveKey = process.env.APPROVE_KEY ?? '';
  const approveLink = `${publicUrl}/api/approve?id=${submission.id}&key=${encodeURIComponent(approveKey)}`;
  const rejectLink = `${publicUrl}/api/reject?id=${submission.id}&key=${encodeURIComponent(approveKey)}`;

  let html = `Please review the new ${escapeHtml(submission.type)} map submission from a user.<br><br>`;
  html += `Approve: <a href="${approveLink}">${approveLink}</a><br>`;
  html += `Reject: <a href="${rejectLink}">${rejectLink}</a><br><br>`;
  html += '<ul>';
  html += `<li>ID: ${submission.id}</li>`;
  html += `<li>Type: ${escapeHtml(submission.type)}</li>`;
  html += detailsList(submission.payload);
  html += '</ul>';

  const msg = {
    to: 'mapadd@bitcoinjungle.app',
    from: 'noreply@bitcoinjungle.app',
    subject: 'New Map Item Pending Approval',
    html,
  };

  if (!process.env.SENDGRID_API_KEY) {
    console.log('SENDGRID_API_KEY not configured; approval email would be sent:', msg);
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}
