// easy-mock模拟数据接口地址

// PRODUCTION
const HOST = 'https://www.kikyospace.cn/';

// const HOST1 = "http://sgmark.sqmall.top:9001/";
// const HOST1 = "http://172.19.182.61/";
const HOST1 = 'http://api.station.mayishoubei.com/';
// const TESTHOST = 'https://shoubeics.mayishoubei.com/business/api';
// const TESTHOST = 'http://101.132.227.185:9090/business/api'
const TESTHOST = 'http://open.mayishoubei.com/business/api';
// const TESTHOST = 'http://ding.mayishoubei.com/';
// const TESTHOST = 'http://sgmark.top:9090/business/api'
// const HOST1 ="http://192.168.1.133:9000/"
// const HOST1 = "http://180.153.19.161:9000/";

// const HOST1 = "http://open.mayishoubei.com/";

// test
// const HOST                      = 'https://test.kikyospace.cn/';

/*
    common
*/

// 登陆


export const GET_CATEGORY = HOST1 + 'admin/api';
export const UPDATA_PRICE = HOST1 + 'admin/api';
export const UPDATA_STOCK = HOST1 + 'admin/api';
export const TRANSDATA_LIST = HOST1 + 'admin/api';
export const DATA_ALL = HOST1 + 'admin/api';
export const DETAIL_TRAN = HOST1 + 'admin/api';
export const GET_AMEND = HOST1 + 'admin/api';
export const OUT_IN = HOST1 + 'admin/api';

//获取验证码
export const GET_FACK_CAPTCHA = HOST1 + 'terminal/api';


//picc获取
export const GET_PRODUCT = HOST1 + 'picc/api';
// PICC新增产品
export const ADD_PRODUCT = HOST1 + 'picc/api';
//PICC未通过列表
export const GET_NOPASS = HOST1 + 'picc/api';
//PICC导出
// export const TO_EXPORT = "http://dog.mayishoubei.com/out/excel/outOrderExcel.jhtml";
export const TO_EXPORT = 'http://open.mayishoubei.com/out/excel/outOrderExcel';
// export const TO_EXPORT = "http://shoubeics.mayishoubei.com/out/excel/outOrderExcel";
// PICC导入
export const TO_LEAD = HOST1 + 'picc/api';


// 大件
export const LOGIN = TESTHOST;
export const GET_ORDERLIST = TESTHOST;
// export const GET_ORDERLIST = 'http://dog.mayishoubei.com/business/api'
export const GET_ORDERDETAIL = TESTHOST;
export const GET_RECYCLERSLIST = TESTHOST;
export const UPDATA_OEDERSTATUS = TESTHOST;
export const GET_RECYCLERBYID = TESTHOST;
export const GET_SUNRECYCLERSLIST = TESTHOST;
export const GET_COMPANYRANGE = TESTHOST;
export const GET_AREABYID = TESTHOST;
export const GET_RECLERSAPPLY = TESTHOST;
export const SAVERECYCLERSRANGE = TESTHOST;
export const GET_ALLRECYCLERSLIST = TESTHOST;
export const EDITORDELFLAG = TESTHOST;
export const GET_AGREERECYLERS = TESTHOST;
export const GET_AREARECYCLERSRANGE = TESTHOST;
export const TOPLIST = TESTHOST;
export const DIGITALSECONDLIST = TESTHOST;
export const DIGITALDETAIL = TESTHOST;
export const UPDATAPRICE = TESTHOST;
export const UPDATEBASEPRICE = TESTHOST;
export const DELRECYLE = TESTHOST;
export const EDITORSTATUS = TESTHOST;
export const FINDIDCARD = TESTHOST;
export const ABILITYLIST = TESTHOST;
export const ABILITYDETAILLIST = TESTHOST;
export const CANCELORDEREXAMINE = TESTHOST;


//手机号码登录
export const FAKE_TEL_LOGIN = HOST1 + 'terminal/api';
//首页模块
export const GET_INDEX_MODEL = HOST + 'business/dashboard/load';
//首页大盘 豆腐块
export const INDEX_MODEL_LIST = HOST1 + 'enterprise/api';
//首页大盘 销售额
export const INDEX_SALE_LIST = HOST + 'business/dashboard/saleList';
//首页大盘 订单数
export const INDEX_ORDER_LIST = HOST1 + 'enterprise/api';
//以旧换新企业端数据查看详情
export const GET_CODE_DETAILS = HOST1 + 'enterprise/api';
// 新增或者更改终端
export const ADD_TERMINAL = HOST1 + 'enterprise/api';
//删除终端
export const DELETE_TERMINAL = HOST1 + 'enterprise/api';
// 订单
export const ORDER_LIST = HOST1 + 'enterprise/api';
//订单查询导出1
export const ORDER_LIST_EXPORT = HOST + 'business/order/list/export';
//订单查询导出2
export const ORDER_INTERVAL_EXPORT = HOST + 'business/order/interval/export';

//查询反馈列表
export const QUERY_FEEDBACK_LIST = HOST1 + 'enterprise/api';
//更新处理状态
export const UPDATE_EVENT_STATUS = HOST + 'business/feedback/updateStatus';
//删除
export const DELDTE_EVENT_STATUS = HOST + 'business/feedback/delete';
//发现列表查询
export const QUERY_FIND_LIST = HOST + 'business/photo/list';
//删除图片
export const DEL_PHOTO = HOST + 'business/photo/delete';
