/* eslint-disable no-dupe-keys */
import axios from 'axios';
import jsSHA from 'jssha';

//如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
function GetAuthorizationHeader() {
  let AppID = process.env.VUE_APP_ID;
  let AppKey = process.env.VUE_APP_KEY;

  let GMTString = new Date().toGMTString();
  let ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  let HMAC = ShaObj.getHMAC('B64');
  let Authorization =
    'hmac username="' +
    AppID +
    '", algorithm="hmac-sha1", headers="x-date", signature="' +
    HMAC +
    '"';

  return {
    Authorization: Authorization,
    'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/,
  };
}

// baseURL是你API的主要Domain，之後發請求時只要填相對路徑就可以了
const instance = axios.create({
  baseURL: 'https://ptx.transportdata.tw/MOTC/v2/',
  headers: GetAuthorizationHeader(),
  timeout: 20000,
});

// Request Interceptors
// 此處的instance為我們create的實體
instance.interceptors.request.use({
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  },
});

// Response Interceptors
// 此處的instance為我們create的實體
instance.interceptors.response.use({
  function(response) {
    return response;
  },
  function(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          console.log('找不到頁面');
          break;
        case 500:
          console.log('發生問題');
          break;
        default:
          console.log(error.message);
      }
    }
    if (!window.navigator.onLine) {
      alert('網路出了點問題，請重新連線');
      return;
    }
    return Promise.reject(error);
  },
});

// 封裝請求
export default function (method, url, data = null, config) {
  method = method.toLowerCase();
  switch (method) {
    case 'post':
      return instance(url, data, config);
    case 'get':
      return instance(url, { params: data });
    case 'delete':
      return instance.delete(url, { params: data });
    case 'put':
      return instance.put(url, data);
    case 'patch':
      return instance.patch(url, data);
    default:
      console.log(`未知的method: ${method}`);
      return false;
  }
}
