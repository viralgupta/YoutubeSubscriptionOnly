import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from './Spinner'

function Home() {
  const [user, setUser] = useState()
  const [api, setApi] = useState()
  const [quota, setQuota] = useState(0)
  const [videodata, setVideodata] = useState([])
  const [quatitytobemapped, setQuatitytobemapped] = useState(15)
  const [loading, setLoading] = useState(false)
  const [videodataavailable, setVideodataavailable] = useState(false)
  const apiref = useRef("")
  const channelIdref = useRef("")
  const checkboxref = useRef()
  const toastconfig = {
    position: "bottom-center",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  }

  useEffect(() => {
    const apin = getCookieValue("APIkey");
    const channelId = getCookieValue("channelId")
    const name = getCookieValue("name")
    const picture = getCookieValue("picture")
    const newquota = getCookieValue("quota")
    const access_token = getCookieValue("ACCESS_TOKEN")
    const refresh_token = getCookieValue("REFRESH_TOKEN")
    const expires_in = getCookieValue('expires_in')
    if (newquota) {
      increaseQuota(0, newquota)
    }
    if (apin) {
      setApi(apin)
    }
    if (channelId) {
      const user = {
        channelId,
        name,
        picture
      }
      setUser(user)
    }
    if (access_token) {
      const user = {
        access_token,
        refresh_token,
        expires_in,
        name,
        picture
      }
      setUser(user)
    }
    const success = getCookieValue("success")
    const error = getCookieValue("error")
    const errorr = getCookieValue("errorr")
    if (success) {
      toast.success(success, toastconfig)
      document.cookie = "success=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    else if (error) {
      toast.error(error, toastconfig)
      document.cookie = "error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    else if (errorr) {
      toast.error(errorr, toastconfig)
      document.cookie = "error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      initiatelogout()
    }
  }, [])

  const increaseQuota = (f, n) => {
    if (f == 0) {
      setQuota(Number(n))
    }
    else {
      document.cookie = `quota=${encodeURIComponent(quota + Number(n))}`
      setQuota(e => e + Number(n))
    }
    const datee = getCookieValue('date');
    if (!datee) {
      const date = new Date();
      const options = {
        timeZone: 'America/Los_Angeles',
        weekday: 'long',
      };
      const pacificTime = date.toLocaleString('en-US', options);
      document.cookie = `date=${encodeURIComponent(pacificTime)}`
    }
    if (datee) {
      const date = new Date();
      const options = {
        timeZone: 'America/Los_Angeles',
        weekday: 'long',
      };
      const pacificTime = date.toLocaleString('en-US', options);
      if (datee !== pacificTime) {
        toast.success("Api Quota has been reset!!!", toastconfig)
        document.cookie = `date=${encodeURIComponent(pacificTime)}`
        document.cookie = `quota=${encodeURIComponent(0)}`
        setQuota(0)
      }
    }

  }

  const initiateApikey = async (e) => {
    e.preventDefault()
    try {
      const options = {
        key: apiref.current.value,
        channelId: "UCqVDpXKLmKeBU_yyt_QkItQ",
        maxResults: 1,
        part: 'snippet'
      }
      const qs = new URLSearchParams(options).toString()
      const res0 = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions?' + qs)
      if (res0.status == 200) {
        toast.success("Api verified Successfully!", toastconfig)
        increaseQuota(1, 1)
        const res = await encdeckey("Encrypt", apiref.current.value)
        document.cookie = `APIkey=${encodeURIComponent(res)}`
        setApi(res)
      }
    } catch (error) {
      toast.error("Api verification Failed :(", toastconfig)
    }
  }

  const initiatechannelid = async (e) => {
    e.preventDefault()
    try {
      const key = await encdeckey("Decrypt", api)
      const options = {
        key: key,
        id: channelIdref.current.value,
        maxResults: 1,
        part: "snippet"
      }
      if (channelIdref.current.value) {
        const qs = new URLSearchParams(options).toString()
        const response = await axios.get("https://www.googleapis.com/youtube/v3/channels?" + qs)
        increaseQuota(1, 1)
        if (response.data.pageInfo.totalResults > 0) {
          toast.success("Channel verified Successfully!", toastconfig)
          const user = {
            channelId: channelIdref.current.value,
            name: response.data.items[0].snippet.title,
            picture: response.data.items[0].snippet.thumbnails.default.url
          }
          setUser(user)
          if (checkboxref.current.checked) {
            document.cookie = `channelId=${encodeURIComponent(channelIdref.current.value)}`
            document.cookie = `name=${encodeURIComponent(response.data.items[0].snippet.title)}`
            document.cookie = `picture=${encodeURIComponent(response.data.items[0].snippet.thumbnails.default.url)}`
          }
        }
        else {
          toast.error("Channel verification Failed :(", toastconfig)
        }
      }
    } catch (error) {
      toast.error("Channel verification Failed :(", toastconfig)
    }
  }

  const getCookieValue = (cookieName) => {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  const encdeckey = async (method, apikey) => {
    try {
      const res = await axios.post("/YoutubeSubscriptionOnly/api/encdecapi", {
        method: method,
        key: apikey
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return res.data.key
    } catch (error) {
      toast.error("Unable to Encrypt/Decrypt API key!")
    }
  }

  const getuserdata = async () => {
    setLoading(true)
    setVideodataavailable(false)
    if (user.channelId) {
      const res = await axios.post("/YoutubeSubscriptionOnly/api/getnewdata", {
        key: api,
        channelId: user.channelId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setVideodataavailable(true)
      setVideodata(res.data.videos);
      increaseQuota(1, res.data.quota);
      setLoading(false)
    }
    else if (user.access_token) {
      const res = await axios.post("/YoutubeSubscriptionOnly/api/getnewdata", {
        key: api,
        ACCESS_TOKEN: user.access_token,
        REFRESH_TOKEN: user.refresh_token,
        expires_in: user.expires_in
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setVideodata(res.data.videos);
      increaseQuota(1, res.data.quota);
      setVideodataavailable(true)
      setLoading(false)
    }
  }

  const initiatelogout = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location = '/'
  }

  useEffect(() => {
    if (api && user) {
      if (quota < 9900) {
        getuserdata()
      }
      else {
        toast.error("Free Quota Spend is Over!!!");
      }
    }
  }, [api, user]);

  const authenticateuser = () => {
    const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
      redirect_uri: process.env.NEXT_PUBLIC_REACT_APP_REDIRECT_URL,
      client_id: process.env.NEXT_PUBLIC_REACT_APP_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/youtube.readonly'
      ].join(" ")
    }
    const qs = new URLSearchParams(options)
    const finalurl = rootURL + '?' + qs.toString()
    return finalurl
  }

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="p-2 bg-gray-900 flex justify-between">
        <div></div>
        <div className="md:text-2xl text-l font-bold flex items-center text-gray-100">
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" className="h-10" alt="" />
          &nbsp;
          Youtube Subscription Only
        </div>
        <div>
          {user && <div className='hidden md:flex text-white items-center'><img className='w-10 mx-2 rounded-full' src={user.picture} alt="" />{user.name}</div>}
        </div>
      </div>
      <div className="bg-black w-full h-full">
        <div className='text-white m-2 border border-gray-400 inline-block p-1 rounded-md hover:cursor-default text-sm md:text-md'>Your Daily Free Quota Spend: {quota}/10000</div>
        {!api && <div className='md:w-3/4 p-10 m-auto'>
          <label htmlFor="text" className="mb-2 text-sm font-medium text-gray-900 dark:text-white flex justify-between">Your Youtube data API key: <div><a rel="noreferrer" target="_blank" href="https://blog.hubspot.com/website/how-to-get-youtube-api-key" className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-500">Learn</a> how to get your API key </div></label>
          <form className='flex'>
            <input ref={apiref} type="text" id="email" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="AIzkdhyACq-gljtJIlZQwkfWSahLIxesvYZ3Os" />
            <button onClick={initiateApikey} type='button' className='text-white p-1 border border-gray-600 hover:cursor-pointer hover:text-gray-400 ml-1 rounded-md'>Submit</button>
          </form>
          <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">We&apos;ll never save your API key, It is always stored in your browser in Encrypted format.</p>
        </div>}
        {api && !user && <div className='md:w-3/4 p-10 m-auto'>
          <label htmlFor="text" className="mb-2 text-sm font-medium text-gray-900 dark:text-white flex justify-between">Your Youtube channel Id <div>Get your <a rel="noreferrer" target="_blank" href="https://www.youtube.com/account_advanced" className="text-sm font-bold text-red-600 hover:underline dark:text-red-500">Channel Id</a> </div></label>
          <form className='flex'>
            <input ref={channelIdref} type="text" id="email" aria-describedby="helper-text-explanation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="UCEhCqn9tRCMpUTe6JqnqFug" />
            <button onClick={initiatechannelid} type='button' className='text-white p-1 border border-gray-600 hover:cursor-pointer hover:text-gray-400 ml-1 rounded-md'>Submit</button>
          </form>
          <div className="mb-6 flex items-center justify-between">
            <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Make sure your Subscription are set to public. <a rel="noreferrer" target="_blank" href="https://www.youtube.com/account_privacy" className="text-sm font-bold text-red-600 hover:underline dark:text-red-500">Set Here</a></p>
            <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem] mt-2">
              <input
                ref={checkboxref}
                className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                type="checkbox"
                value=""
                id="exampleCheck3"
                defaultChecked />
              <label
                className="inline-block text-white pl-[0.15rem] hover:cursor-pointer"
                htmlFor="exampleCheck3">
                Remember me
              </label>
            </div>
          </div>
          <div
            className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
            <p
              className="mx-4 mb-0 text-center font-semibold dark:text-neutral-200">
              OR
            </p>
          </div>
          <a href={authenticateuser()} className='bg-gray-600 w-full text-white p-2 rounded-md flex justify-center items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google mr-1" viewBox="0 0 16 16"> <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" /> </svg>
            Sign In With Google
          </a>
        </div>}
        <div className='md:flex md:flex-wrap md:justify-center'>
          {videodataavailable && videodata.slice(0, quatitytobemapped).map((e, index) => {
            return <iframe src={`https://www.youtube.com/embed/${e}`} key={index} className='md:m-1 mb-2 aspect-video w-full md:w-[32%]' title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen ></iframe>
          })}
        </div>
        {loading && <Spinner />}
        <div className='flex justify-center'>
          {videodataavailable && <div className=''>
            <button onClick={() => { setQuatitytobemapped(q => q + 15) }} className='text-white p-2 border border-gray-500 rounded-md m-2 inline-block'>
              Load More...
            </button>
          </div>}
          {user && <div className=''>
            <button onClick={initiatelogout} className='text-white p-2 border border-gray-500 rounded-md m-2 inline-block'>
              Logout -&gt;
            </button>
          </div>}
        </div>
      </div>
    </>
  );
}

export default Home;
