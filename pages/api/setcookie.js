import { setCookie } from 'cookies-next';

export default function handler(req, res) {
    const { key, value } = req.body;
    setCookie(key, value, {
        req, res,
        maxAge: 3.154e10, // 1 year
        httpOnly: false,
        domain: process.env.DOMAIN,
        path: "/",
        sameSite: "lax",
        secure: false,
    });
    res.status(200).json({success: true})
}
