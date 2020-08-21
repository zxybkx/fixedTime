import { stringify } from 'querystring';
import { history } from 'umi';
import { fakeAccountLogin, fakeTelLogin } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { queryCurrent } from '@/services/user';
import md5 from 'md5';
import { reloadAuthorized } from '@/utils/Authorized';
import { routerRedux } from 'dva/router';

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
    currentUser: {},
  },
  effects: {
    * login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      if (response.code === '0') {
        window.sessionStorage.setItem('token', response.data.token);
        window.sessionStorage.setItem("signKey", response.data.signKey);

        const signdata = { isEvaluated: "0" };
        const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() +
        Math.random()}`;
        const signtimestamp = `${new Date().valueOf()}`;
        const newData = {
          data: signdata,
          app_key: "app_id_3",
          format: "json",
          sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${response.data.token}&version=1.0${response.data.signKey}`),
          version: "1.0",
          nonce: signnonce,
          timestamp: signtimestamp,
          name: "business.company.current",
          token: response.data.token,
        };
        const currentResponse = yield call(queryCurrent, newData);
        window.sessionStorage.setItem("CompanyId", currentResponse.data.id);
        yield put({
          type: 'saveCurrentUser',
          payload: currentResponse.data,
        });

        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            type: 'account',
          },
        });
      }
    },

    logout() {
      const { redirect } = getPageQuery(); // Note: There may be security issues, please note

      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      if (payload.code === '0') {
        setAuthority('admin');
      }
      return { ...state, status: payload.status, type: payload.type };
    },

    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },
  },
};
export default Model;
