const crypto = require("crypto");

const encdec = (method, key) => {
    if (method == 'Encrypt') {
        const algorithm = "aes-256-cbc";
        const initVector = Buffer.from(process.env.INITVECTOR, 'hex');
        const Securitykey = Buffer.from(process.env.SECURITY_KEY, 'hex')
        const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
        let encryptedData = cipher.update(key, "utf-8", "hex");
        encryptedData += cipher.final("hex");
        return encryptedData
    }
    else if (method == 'Decrypt') {
        const algorithm = "aes-256-cbc";
        const initVector = Buffer.from(process.env.INITVECTOR, 'hex');
        const Securitykey = Buffer.from(process.env.SECURITY_KEY, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
        let decryptedData = decipher.update(key, "hex", "utf-8");
        decryptedData += decipher.final("utf8");
        return decryptedData
    }
}

export default function handler(req, res) {
    const { method, key } = req.body;
    const data = encdec(method, key)
    res.json({ key: data })
  }
  