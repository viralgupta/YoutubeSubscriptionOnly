import { deleteCookie, getCookies } from 'cookies-next';

export default function handler(req, res) {
    const cookies = getCookies({ req, res})
    Object.keys(cookies).forEach(key => {
      deleteCookie(key, { req, res })
    });
    res.status(200).json({success: true})
}
