const crypto = require('node:crypto');

const ITERATIONS = 100_000;
const SALT_SIZE = 16;
const HASH_SIZE = 32;

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_SIZE);
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, HASH_SIZE, 'sha256');
  return `${ITERATIONS}.${salt.toString('base64')}.${hash.toString('base64')}`;
}

function verifyPassword(password, storedHash) {
  const segments = storedHash.split('.', 3);
  if (segments.length !== 3) {
    return false;
  }

  const iterations = Number.parseInt(segments[0], 10);
  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false;
  }

  let salt;
  let expectedHash;

  try {
    salt = Buffer.from(segments[1], 'base64');
    expectedHash = Buffer.from(segments[2], 'base64');
  } catch {
    return false;
  }

  const actualHash = crypto.pbkdf2Sync(password, salt, iterations, expectedHash.length, 'sha256');
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
