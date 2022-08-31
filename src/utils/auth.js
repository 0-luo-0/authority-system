import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
//定义token过期时间key
const timeKey = 'expireTime'

/**
 * 获取token
 * @returns 
 */
export function getToken() {
  return Cookies.get(TokenKey)
}

/**
 * 设置token
 * @param token 
 * @returns 
 */
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

/**
 * 删除token
 * @returns 
 */
export function removeToken() {
  return Cookies.remove(TokenKey)
}
/**
* 清空sessionStorage
*/
export function clearStorage(){
  return sessionStorage.clear();
}

/**
 * 设置token过期时间
 */
export function setTokenTime(time){
  return sessionStorage.setItem(timeKey,time);
}

/**
 * 获取token过期时间
 * @param time 
 */
export function getTokenTime(time){
  return sessionStorage.getItem(timeKey,time);
}

/**
 * 清空token过期时间
 * @param time 
 */
export function removeTokenTime(time){
  return sessionStorage.setItem(timeKey,0);
}

  
