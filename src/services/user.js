import request from '@/utils/request';
import {API} from './api'

export async function query() {
  return request('/api/users');
}
export async function queryCurrent(params) {
  return request(API, {
    method: 'POST',
    data: params,
  });
}
export async function queryNotices() {
  return request('/api/notices');
}
