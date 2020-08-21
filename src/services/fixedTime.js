import request from '@/utils/request';
import { API, API2, API3 } from './api';

export async function billConfigAPI(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function setJsfs(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function configurationPoints(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getOrderList(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getOrderDetail(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getOfflineList(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getMoneyDetail(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getAreaList(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function changeState(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function createRecycle(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function getCategory(payload) {
  return request(API2, {
    method: 'POST',
    data: payload,
  });
}

export async function setCategoryPrice(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function recycleView(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function categoryPrice(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function getStatistic(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function getOrderStatistic(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function getIntergralDetail(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}

export async function service(payload) {
  return request(API2, {
    method: 'POST',
    data: payload
  })
}
