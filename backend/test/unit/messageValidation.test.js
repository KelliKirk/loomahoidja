const { validateTextMessagePayload } = require('../../validation/messageValidation');

describe('messageValidation', () => {
  test('rejects missing text', () => {
    const res = validateTextMessagePayload({});
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toBe('Text is required');
  });

  test('accepts valid text', () => {
    const res = validateTextMessagePayload({ text: 'hello' });
    expect(res.ok).toBe(true);
  });
});

