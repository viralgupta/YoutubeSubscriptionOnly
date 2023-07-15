const axios = require("axios")
const crypto = require("crypto");
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

let quota = 0;

const getchannelids = async (options) => {
    quota++
    const qs = new URLSearchParams(options).toString()
    const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions?' + qs)
    const channelIds = response.data.items.map(item => item.snippet.resourceId.channelId).join(',')
    if (!response.data.nextPageToken) {
        return channelIds
    }
    if (response.data.nextPageToken) {
        const option1 = {
            key: options.key,
            channelId: options.channelId,
            maxResults: 50,
            part: "snippet",
            pageToken: response.data.nextPageToken
        }
        getchannelids(option1)
    }
}

const getchannelidswithoauth = async (options, access_token) => {
    quota++
    const qs = new URLSearchParams(options).toString()
    const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions?' + qs, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    const channelIds = response.data.items.map(item => item.snippet.resourceId.channelId).join(',')
    if (!response.data.nextPageToken) {
        return channelIds
    }
    if (response.data.nextPageToken) {
        const option1 = {
            key: options.key,
            maxResults: 50,
            part: "snippet",
            mine: true,
            pageToken: response.data.nextPageToken
        }
        getchannelidswithoauth(option1, access_token)
    }
}



export default async function handler(req, res) {
    try {
        const key = encdec('Decrypt', req.body.key)
        const resultArray = [];
        if (req.body.channelId) {
            const channelId = req.body.channelId
            const option1 = {
                key: key,
                channelId: channelId,
                maxResults: 50,
                part: "snippet"
            }
            const qs = new URLSearchParams(option1).toString()
            quota++
            const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions?' + qs)
            let channelIds = response.data.items.map(item => item.snippet.resourceId.channelId).join(',')
            if (response.data.nextPageToken) {
                const option2 = {
                    key: key,
                    channelId: channelId,
                    maxResults: 50,
                    part: "snippet",
                    pageToken: response.data.nextPageToken
                }
                channelIds = channelIds + ',' + await getchannelids(option2)
            }
            const pieces = channelIds.split(",");
            for (let i = 0; i < pieces.length; i += 50) {
                const chunk = pieces.slice(i, i + 50);
                resultArray.push(chunk.join(","));
            }
        }
        else if (req.body.ACCESS_TOKEN) {
            const ACCESS_TOKEN = req.body.ACCESS_TOKEN;
            const REFRESH_TOKEN = req.body.REFRESH_TOKEN;
            let expires_in = req.body.expires_in;
            let access_token = encdec('Decrypt', ACCESS_TOKEN)
            const refresh_token = encdec('Decrypt', REFRESH_TOKEN)
            let currentDate = new Date();
            let givenDate = new Date(expires_in);

            if (currentDate.getTime() > givenDate.getTime()) {
                const url = 'https://www.googleapis.com/oauth2/v4/token'
                const values = {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    refresh_token: refresh_token,
                    grant_type: 'refresh_token'
                }
                const qs = new URLSearchParams(values).toString()
                const resp = await axios.post(url, qs, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
                access_token = resp.data.access_token;
                let date = new Date();
                date.setTime(date.getTime() + resp.data.expires_in * 1000);
                setCookie("expires_in", date.toISOString(), { req, res,
                    maxAge: 3.154e10, // 1 year
                    httpOnly: false,
                    domain: process.env.DOMAIN,
                    path: "/",
                    sameSite: "lax",
                    secure: false,
                });
                const ACCESS_TOKEN = encdec('Encrypt', access_token)
                setCookie("ACCESS_TOKEN", ACCESS_TOKEN, { req, res,
                    maxAge: 3.154e10, // 1 year
                    httpOnly: false,
                    domain: process.env.DOMAIN,
                    path: "/",
                    sameSite: "lax",
                    secure: false,
                });
            }
            const option11 = {
                key: key,
                mine: true,
                maxResults: 50,
                part: "snippet"
            }
            const qs = new URLSearchParams(option11).toString()
            quota++
            const response00 = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions?' + qs, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            let channelIds = response00.data.items.map(item => item.snippet.resourceId.channelId).join(',')
            if (response00.data.nextPageToken) {
                const option2 = {
                    key: key,
                    mine: true,
                    maxResults: 50,
                    part: "snippet",
                    pageToken: response00.data.nextPageToken
                }
                channelIds = channelIds + ',' + await getchannelidswithoauth(option2, access_token)
            }
            const pieces = channelIds.split(",");
            for (let i = 0; i < pieces.length; i += 50) {
                const chunk = pieces.slice(i, i + 50);
                resultArray.push(chunk.join(","));
            }
        }
        let response2array = []
        for (let index = 0; index < resultArray.length; index++) {
            quota++
            const option3 = {
                key: key,
                id: resultArray[index],
                maxResults: 50,
                part: "contentDetails"
            };
            const qs2 = new URLSearchParams(option3).toString()
            const response2 = await axios.get('https://www.googleapis.com/youtube/v3/channels?' + qs2)
            response2array = response2array.concat(response2.data.items)
        }

        let response3array = []
        for (let index = 0; index < response2array.length; index++) {
            quota++
            const option4 = {
                key: key,
                playlistId: response2array[index].contentDetails.relatedPlaylists.uploads,
                maxResults: 2,
                part: "snippet"
            };
            const qs3 = new URLSearchParams(option4).toString();
            const response3 = await axios.get('https://youtube.googleapis.com/youtube/v3/playlistItems?' + qs3);
            for (let index = 0; index < response3.data.items.length; index++) {
                response3array.push(response3.data.items[index].snippet)
            }
        }
        response3array.sort((a, b) => {
            const dateA = new Date(a.publishedAt);
            const dateB = new Date(b.publishedAt);
            return dateB - dateA;
        })
        let response4array = []
        for (let index = 0; index < response3array.length; index++) {
            response4array.push(response3array[index].resourceId.videoId)
        }
        const newquota = quota;
        quota = 0;
        res.json({ videos: response4array, quota: newquota })
    } catch (error) {
        setCookie("errorr", "Could Not Get Video Data, Resetting!", { req, res,
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
