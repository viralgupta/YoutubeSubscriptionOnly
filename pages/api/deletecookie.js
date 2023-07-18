import { setCookie, getCookies } from 'cookies-next';

export default function handler(req, res) {
    const cookies = getCookies({ req, res})
    Object.keys(cookies).forEach(key => {
      setCookie(key, "Deleting", { req, res,
        maxAge: 5, // 1 year
        httpOnly: false,
        domain: process.env.DOMAIN,
        path: "/",
        sameSite: "lax",
        secure: false,
        expires: new Date(0)
    });
    });
    res.status(200).json({success: true})
}
