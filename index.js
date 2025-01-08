const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

require('dotenv').config();
app.use(bodyParser.json());

// Подключение к базе данных
const db = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: '',
  database: process.env.db,
});

function generateShortUrl() {
  return crypto.randomBytes(3).toString('hex');
}

app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Поле originalUrl обязательно' });
  }

  const shortUrl = generateShortUrl();
  const createdAt = new Date();

  try {
    await db.execute(
      'INSERT INTO urls (shortUrl, originalUrl, createdAt) VALUES (?, ?, ?)',
      [shortUrl, originalUrl, createdAt]
    );

    res.json({ shortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM urls WHERE shortUrl = ?', [shortUrl]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ссылка не найдена' });
    }

    const urlData = rows[0];

    await db.execute('UPDATE urls SET clickCount = clickCount + 1 WHERE shortUrl = ?', [shortUrl]);

    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/info/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM urls WHERE shortUrl = ?', [shortUrl]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ссылка не найдена' });
    }

    const urlData = rows[0];

    res.json({
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      clickCount: urlData.clickCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/delete/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM urls WHERE shortUrl = ?', [shortUrl]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ссылка не найдена' });
    }

    res.json({ message: 'Ссылка успешно удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
