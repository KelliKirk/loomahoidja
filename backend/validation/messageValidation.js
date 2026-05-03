function validateTextMessagePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Invalid payload'] };
  }
  const text = payload.text;
  if (!text || String(text).trim().length === 0) {
    errors.push('Text is required');
  }
  if (String(text || '').length > 5000) {
    errors.push('Text is too long');
  }
  return { ok: errors.length === 0, errors };
}

module.exports = { validateTextMessagePayload };

