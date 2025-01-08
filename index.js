const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const cors = require('cors')
const app = express();
const port = 3000;

require('dotenv').config();
app.use(bodyParser.json());
app.use(cors())
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
    const { originalUrl, expiresAt } = req.body;
  
    if (!originalUrl) {
      return res.status(400).json({ error: 'Поле originalUrl обязательно' });
    }
  
    // Проверка на валидность expiresAt (если оно есть)
    const expiresDate = expiresAt ? new Date(expiresAt) : null;
    const shortUrl = generateShortUrl();
    const createdAt = new Date();
  
    try {
      await db.execute(
        'INSERT INTO urls (shortUrl, originalUrl, createdAt, expiresAt) VALUES (?, ?, ?, ?)',
        [shortUrl, originalUrl, createdAt, expiresDate]
      );
  
      res.json({ shortUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });
  

app.get('/shorten/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
  
    try {
      const [rows] = await db.execute('SELECT * FROM urls WHERE shortUrl = ?', [shortUrl]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Ссылка не найдена' });
      }
  
      res.json(rows[0]);  // Возвращаем данные по найденной ссылке
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  app.get('/shorten', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM urls');
      res.json(rows);  // Возвращаем все ссылки
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

app.delete('/shorten/:shortUrl', async (req, res) => {
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
