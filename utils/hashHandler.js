const crypto = require('crypto');

// Function to encrypt a string
exports.encrypt = (text) => {
  try {
    const secretKey = process.env.EMAIL_SECRET;
    const iv = Buffer.from(process.env.HASH_IV, 'hex'); // Convert IV string to Buffer
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return  encrypted
  } catch (error) {
    console.log(error);
  }
};

// Function to decrypt an encrypted string
exports.decrypt = (encryptedData) => {
  const secretKey = process.env.EMAIL_SECRET;
  const iv = Buffer.from(process.env.HASH_IV, 'hex'); // Convert IV string to Buffer

  const key = crypto.createHash('sha256').update(secretKey).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


exports.compare = (original, encrypted) => {
  const decrypted = exports.decrypt(encrypted);
  return original === decrypted;
};
