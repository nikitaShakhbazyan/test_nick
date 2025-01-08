const request = require('supertest');
const app = require('../index.js');

describe('URL Shortener', () => {
  let shortUrl;

  it('should create a unique short URL', async () => {
    const res = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('shortUrl');
    shortUrl = res.body.shortUrl;
    expect(shortUrl).toMatch(/^http:\/\/localhost:3000\/[a-f0-9]{6}$/);
  });

  it('should redirect to the original URL', async () => {
    const res = await request(app).get(`/${shortUrl.split('/').pop()}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');
  });

  it('should return 410 if the URL has expired', async () => {
    const expiredShortUrl = 'expiredUrl'; 
    const res = await request(app).get(`/${expiredShortUrl}`);

    expect(res.status).toBe(410);
  });
});
