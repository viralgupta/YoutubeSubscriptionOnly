const axios = require("axios")
const crypto = require("crypto");
const jwt = require('jsonwebtoken')
import { setCookie } from 'cookies-next';

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

export default async function handler(req, res) {
    if (!req.query.error) {
        const authorization_code = req.query.code;
        const url = 'https://oauth2.googleapis.com/token'
        const values = {
            code: authorization_code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URL,
            grant_type: 'authorization_code'
        }
        try {
            const resp = await axios.post(url, new URLSearchParams(values).toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            const { id_token, access_token, refresh_token, expires_in } = resp.data
            
            const data = jwt.decode(id_token)
            
            let date = new Date();
            date.setTime(date.getTime() + expires_in * 1000);
            
            const ACCESS_TOKEN = encdec('Encrypt', access_token)
            const REFRESH_TOKEN = encdec('Encrypt', refresh_token)
            
            setCookie('ACCESS_TOKEN', ACCESS_TOKEN, { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            setCookie("REFRESH_TOKEN", REFRESH_TOKEN, { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            setCookie("expires_in", date.toISOString(), { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            setCookie("name", data.name, { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            setCookie("picture", data.picture, { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            setCookie("success", "Google Account Verified Successfully!!", { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            res.redirect(`${process.env.ORIGIN}`)
        }
        catch (error) {
            setCookie("error", "Could Not Verify Google Account", { req, res,
                maxAge: 3.154e10, // 1 year
                httpOnly: false,
                domain: process.env.DOMAIN,
                path: "/",
                sameSite: "lax",
                secure: false,
            });
            res.redirect(`${process.env.ORIGIN}`)
        }
    }
    else {
        setCookie("error", "Could Not Verify Google Account", { req, res,
            maxAge: 3.154e10, // 1 year
            httpOnly: false,
            domain: process.env.DOMAIN,
            path: "/",
            sameSite: "lax",
            secure: false,
        });
        res.redirect(`${process.env.ORIGIN}`)
    }
}
