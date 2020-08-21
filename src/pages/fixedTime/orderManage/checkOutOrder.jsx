import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Form, Row, Col, Card, Tabs, Descriptions, Rate, Modal, Table, Divider, message, Button } from 'antd';
import md5 from 'md5';
import { history } from 'umi';
import { connect } from 'dva';
import _ from 'lodash';
import styles from './index.less';

const { Item: FormItem } = Form;
const { TabPane } = Tabs;
const { Item: DescriptionsItem } = Descriptions;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
}))
class CheckOutOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      initialParams: {
        app_key: 'app_id_3',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      orderData: {},
      modalData: [],   // 查看明细数据
      tabKey: null,
    };
  }

  componentDidMount() {
    const { location: { query: { tabKey } } } = this.props;
    this.setState({ tabKey });
    this.loadData(tabKey);
  };

  loadData = (key) => {
    const { dispatch, location: { query: { id, recyclerId, netId, orderNo, payType, categoryName } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    const data = key === '1' ?
      {
        orderNo,
        id,
        recyclerId,
        netId,
      } :
      {
        orderId: id,
        title: categoryName === '废弃家电' ? 1 : categoryName === '生活垃圾' ? 2 : 7,
        payType,
      };
    const params = {
      ...initialParams,
      data,
      name: key === '1' ? 'business.order.getOrderDetailByOrderId' : 'business.order.getCategoryInfoByOrderId',
      nonce: signnonce,
      timestamp: `${new Date().valueOf()}`,
      sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
    };
    dispatch({
      type: 'fixedTime/getOrderDetail',
      payload: params,
    }).then(res => {
      if (res.code === '0') {
        this.setState({
          orderData: res.data,
        });
      }
    });
  };

  getToken = () => {
    if (window.sessionStorage.getItem('token')) {
      return window.sessionStorage.getItem('token');
    } else {
      history.push('/user');
    }
  };

  getSignKey = () => {
    if (window.sessionStorage.getItem('signKey')) {
      return window.sessionStorage.getItem('signKey');
    } else {
      history.push('/user');
    }
  };

  renderPageHeaderContent = () => {
    const { location: { query: { completeDate, userName, tel, categoryName } } } = this.props;
    const { tabKey } = this.state;
    const layout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };

    return (
      <Form className={styles.pageHeaderContent} {...layout}>
        <Descriptions column={2}>
          <DescriptionsItem
            label='订单类型'>{categoryName}
          </DescriptionsItem>
          <DescriptionsItem
            label='完成时间'>{completeDate}
          </DescriptionsItem>
          <DescriptionsItem
            label='用户姓名'>{userName}
          </DescriptionsItem>
          <DescriptionsItem
            label='手机号码'>{tel}
          </DescriptionsItem>
        </Descriptions>
        <Tabs activeKey={tabKey} onChange={this.tabChange} style={{ marginBottom: '-30px' }}>
          <TabPane tab='订单详情' key={1}/>
          <TabPane tab='回收物信息' key={2}/>
        </Tabs>
      </Form>
    );
  };

  checkDetail = () => {
    const { dispatch, location: { query: { id, payType } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    this.setState({
      visible: true,
    });
    dispatch({
      type: 'fixedTime/getMoneyDetail',
      payload: {
        ...initialParams,
        data: {
          orderId: id,
          payType,
        },
        name: 'business.order.getOrderDetailPrice',
        nonce: signnonce,
        timestamp: `${new Date().valueOf()}`,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          this.setState({
            modalData: res.data,
          });
        }
      }
    });
  };

  onCopy = (num) => {
    console.log('num', num);
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', num);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      message.success('复制成功');
    } else {
      message.error('复制失败');
    }
  };

  renderOrderDetail = () => {
    const { location: { query: { payType } } } = this.props;
    const { orderData } = this.state;
    const { dsddRecyclePosition: recyclePoint } = orderData;
    const { recyclers: recycleStaff } = orderData;
    const { orderEvaluation: orderEval } = orderData;
    const { order: Order } = orderData;
    const recycleZfbNum = orderData.paymentNo;    // 回收物支付宝交易号
    const infoZfbNum = orderData.paymentPriceNo;    // 信息费支付宝交易号

    return (
      <div className={styles.orderDetail}>
        <Card title='回收点信息'>
          <Descriptions>
            <DescriptionsItem
              label='回收点编号'>{(recyclePoint && recyclePoint.positionNo) ? recyclePoint.positionNo : '/'}</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem
              label='回收点名称'>{(recyclePoint && recyclePoint.positionName) ? recyclePoint.positionName : '/'}</DescriptionsItem>
            <DescriptionsItem
              label='联系电话'>{(recyclePoint && recyclePoint.contactTel) ? recyclePoint.contactTel : '/'}</DescriptionsItem>
            <DescriptionsItem
              label='地址'>{(recyclePoint && recyclePoint.address) ? recyclePoint.address : '/'}</DescriptionsItem>
          </Descriptions>
        </Card>
        <Card title='回收人员信息' style={{ marginTop: '10px' }}>
          <Descriptions>
            <DescriptionsItem
              label='姓名'>{(recycleStaff && recycleStaff.name) ? recycleStaff.name : '/'}</DescriptionsItem>
            <DescriptionsItem
              label='电话'>{(recycleStaff && recycleStaff.tel) ? recycleStaff.tel : '/'}</DescriptionsItem>
          </Descriptions>
        </Card>
        <Card title='交易信息' style={{ marginTop: '10px' }}>
          <span className={styles.subtitle}>回收物交易信息</span>
          <Descriptions>
            <DescriptionsItem
              label='结算方式'>{payType === '0' ? '卖钱' : payType === '1' ? '环保积分' : '蚂蚁森林能量'}</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem
              label={payType === '0' ? '成交价格' : payType === '1' ? '服务商积分' : '蚂蚁能量'}>
              {payType === '0' && '￥'}
              {payType === '0' ? (Order && Order.achPrice || '/') : payType === '1' ? (Order && Order.companyPoint || '/') : '有'}
            </DescriptionsItem>
            <DescriptionsItem label='平台积分'>{Order && Order.greenCount || '/'}积分</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem label='支付方'>{orderData.paymentUser || '/'}</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem label='支付方式'>{orderData.paymentType || '/'}</DescriptionsItem>
            <DescriptionsItem label='支付宝交易号'><a onClick={() => this.onCopy(recycleZfbNum)}>点击复制</a></DescriptionsItem>
          </Descriptions>
          <span className={styles.subtitle}>信息费交易信息</span>
          <Descriptions column={1}>
            <DescriptionsItem label='平台信息费'>
              {'￥'}{Order && Order.commissionsPrice}&emsp;
              <a onClick={this.checkDetail}>查看明细 </a>
            </DescriptionsItem>
            <DescriptionsItem label='支付方'>{orderData.paymentPriceUser || '/'}</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem label='支付方式'>{orderData.paymentPriceType || '/'}</DescriptionsItem>
            <DescriptionsItem label='支付宝交易号'><a onClick={() => this.onCopy(infoZfbNum)}>点击复制</a></DescriptionsItem>
          </Descriptions>
        </Card>
      </div>
    );
  };

  renderRecycleInfo = () => {
    const { location: { query: { payType } } } = this.props;
    const { orderData } = this.state;

    return (
      <Card title='回收物明细' className={styles.recycleInfo}>
        {
          _.map(orderData, dataItem => {
            const categoryData = _.groupBy(dataItem.categoryInfoList, 'title');
            return (
              <div>
                {
                  _.map(categoryData, (item, k) => {
                    return (
                      <Card title={k} key={k}>
                        {
                          _.map(item, (param, idx) => {
                            return (
                              <div key={idx}>
                                <span className={styles.subtitle}>{param.parentName}</span>
                                {
                                  _.map(param.businessOrderItemList, (i, index) => {
                                    return (
                                      <Row key={index}>
                                        <Col span={8}>{i.categoryName}</Col>
                                        {
                                          payType === '2' ? null :
                                            <Col span={4}>
                                              {payType === '0' && '￥'}
                                              {payType === '0' ? i.price : i.point}&nbsp;
                                              {payType === '1' && '积分'}/{i.unit}
                                            </Col>
                                        }
                                        <Col span={4}>{i.amount}{i.unit}</Col>
                                      </Row>
                                    );
                                  })
                                }
                                <Divider/>
                              </div>
                            );
                          })
                        }
                        <Row>
                          <Col span={payType === '2' ? 8 : 12}>合计</Col>
                          <Col span={4}>
                            <span className={styles.total}>
                              {k === '废弃家电' && payType === '0' && '￥'}
                              {dataItem.sumAmount}
                              {k === '生活垃圾' && 'kg'}
                              {k === '废弃家电' && payType !== '0' && '台'}
                            </span>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })
                }
              </div>
            );
          })
        }
      </Card>
    );
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  tabChange = (key) => {
    this.loadData(key);
    this.setState({ tabKey: key });
  };

  render() {
    const { location: { query: { orderNo, current } } } = this.props;
    const { visible, modalData, tabKey } = this.state;
    const columns = [
      {
        title: '品类名称',
        dataIndex: 'parentName',
        key: 'parentName',
        render: (value, record, index) => {
          const obj = {
            children: value,
            props: {},
          };
          const start = _.findIndex(modalData.listReturn, o => {
            return o.parentName === record.parentName;
          });
          const end = _.findLastIndex(modalData.listReturn, o => {
            return o.parentName === record.parentName;
          });
          if (index === start) {
            obj.props.rowSpan = end - start + 1;
          }
          if (index > start && index <= end) {
            obj.props.rowSpan = 0;
          }
          return obj;
        },
      },
      {
        title: '回收物名称',
        dataIndex: 'categoryName',
        key: 'categoryName',
      },
      {
        title: '回收数量',
        dataIndex: 'amount',
        key: 'amount',
        render: (text, record) => <span>{text}{record.unit}</span>,
      },
      {
        title: '平台信息费',
        dataIndex: 'price',
        key: 'price',
        render: (text) => <span>￥{text}</span>,
      },
    ];

    return (
      <PageHeaderWrapper
        title={<span>订单编号：{orderNo}</span>}
        subTitle={<a onClick={() => this.onCopy(orderNo)}>点击复制</a>}
        extra={[
          <Button
            type='primary'
            onClick={() => history.push(`/fixedTime/orderManage?current=${current}`)}>
            返回
          </Button>,
        ]}
        content={this.renderPageHeaderContent()}>
        <div className={styles.content}>
          {
            tabKey === '1' ? this.renderOrderDetail() : this.renderRecycleInfo()
          }
          <Modal
            title='回收金额明细'
            visible={visible}
            onCancel={this.handleCancel}
            footer={null}>
            <Table columns={columns} dataSource={modalData.listReturn}/>
          </Modal>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default CheckOutOrder;
