const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;
app.use(bodyParser.json());

// Временное хранилище для ссылок (можно заменить на базу данных)
const urlDatabase = {};

function generateShortUrl() {
  return crypto.randomBytes(3).toString('hex');
}

app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Поле originalUrl обязательно' });
  }

  const shortUrl = generateShortUrl();
  const createdAt = new Date().toISOString();

  urlDatabase[shortUrl] = {
    originalUrl,
    createdAt,
    clickCount: 0,
  };

  res.json({ shortUrl });
});

app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const urlData = urlDatabase[shortUrl];

  if (!urlData) {
    return res.status(404).json({ error: 'Ссылка не найдена' });
  }

  urlData.clickCount += 1;

  res.redirect(urlData.originalUrl);
});

app.get('/info/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;
  const urlData = urlDatabase[shortUrl];

  if (!urlData) {
    return res.status(404).json({ error: 'Ссылка не найдена' });
  }

  res.json({
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    clickCount: urlData.clickCount,
  });
});


app.delete('/delete/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  if (!urlDatabase[shortUrl]) {
    return res.status(404).json({ error: 'Ссылка не найдена' });
  }

  delete urlDatabase[shortUrl];
  res.json({ message: 'Ссылка успешно удалена' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
