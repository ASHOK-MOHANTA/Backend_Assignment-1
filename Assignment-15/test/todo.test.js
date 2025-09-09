const request = require('supertest');
const app = require('../src/app');

describe('Todo API', () => {
  it('should return healthcheck', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
