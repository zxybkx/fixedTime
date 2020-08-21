import * as service from '../services/fixedTime';

export default {
  namespace: 'fixedTime',
  state: {
    recycleData: {},
  },

  effects: {
    * getListData({ payload }, { call }) {
      return yield call(service.setJsfs, payload);
    },

    * setJsfs({ payload }, { call }) {
      return yield call(service.setJsfs, payload);
    },

    * configurationPoints({ payload }, { call }) {
      return yield call(service.configurationPoints, payload);
    },

    * getOrderList({ payload }, { call }) {
      return yield call(service.getOrderList, payload);
    },

    * getOrderDetail({ payload }, { call }) {
      return yield call(service.getOrderDetail, payload);
    },

    * getOfflineList({ payload }, { call }) {
      return yield call(service.getOfflineList, payload);
    },

    * getMoneyDetail({ payload }, { call }) {
      return yield call(service.getMoneyDetail, payload);
    },

    * getAreaList({ payload }, { call }) {
      return yield call(service.getAreaList, payload);
    },

    * changeState({ payload }, { call }) {
      return yield call(service.changeState, payload);
    },

    * createRecycle({ payload }, { call }) {
      return yield call(service.createRecycle, payload);
    },

    * getCategory({ payload }, { call }) {
      return yield call(service.getCategory, payload);
    },

    * setCategoryPrice({ payload }, { call }) {
      return yield call(service.setCategoryPrice, payload);
    },

    * recycleView({ payload }, { call }) {
      return yield call(service.recycleView, payload);
    },

    * categoryPrice({ payload }, { call }) {
      return yield call(service.categoryPrice, payload);
    },

    *getStatistic({payload}, {call}) {
      return yield call(service.getStatistic, payload);
    },

    *getOrderStatistic({payload}, {call}) {
      return yield call(service.getOrderStatistic, payload);
    },

    *getIntergralDetail({payload}, {call}) {
      return yield call(service.getIntergralDetail, payload);
    },

    *getStaticsData({payload}, {call}) {
      return yield call(service.service, payload)
    }
  },

  reducers: {
    changeState(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
