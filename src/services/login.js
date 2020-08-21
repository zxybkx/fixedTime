import request from '@/utils/request';
import * as config from './config';

// 账号登录
export async function fakeAccountLogin(params) {
  return request(config.LOGIN,{
    method: 'POST',
    data: params,
  });
}

// 手机号登录
export async function fakeTelLogin(params) {
  return request(config.FAKE_TEL_LOGIN, {
    method: "POST",
    body: {
      ...params,
      method: "post"
    }
  });
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
