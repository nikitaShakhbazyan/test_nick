CREATE TABLE IF NOT EXISTS urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shortUrl VARCHAR(6) NOT NULL UNIQUE,
  originalUrl TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME DEFAULT NULL,
  clickCount INT DEFAULT 0
);
