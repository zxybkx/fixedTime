import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Row, Col, Statistic, Card, Tooltip, Table, Divider, message, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { history } from 'umi';
import md5 from 'md5';
import styles from './index.less';

@connect(({ fixedTime }) => ({
  fixedTime,
}))
class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      initialParams: {
        app_key: 'app_id_1',
        name: 'recyclePosition.statistics.view',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      orderData: {},   // 订单交易统计数据
      currentPage: 1,
    };
  }

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

  componentDidMount() {
    const { dispatch, location: { query: { id } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getStatistic',
      payload: {
        ...initialParams,
        data: { id },
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          this.setState({
            data: res.data,
          });
        }
      } else {
        message.error('数据请求失败！');
      }
    });

    // 订单交易统计
    this.getOrderStatistic(1);
  }

  getOrderStatistic = (pageNo) => {
    const { dispatch, location: { query: { id } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getOrderStatistic',
      payload: {
        ...initialParams,
        name: 'recyclePosition.statistics.orderView',
        data: {
          pageNo,
          pageSize: 10,
          positionId: id,
        },
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          orderData: res.data,
        });
      } else {
        message.error('数据请求失败！');
      }
    });
  };

  // 分页回调
  handlePageChange = (page) => {
    this.getOrderStatistic(page);
    this.setState({
      currentPage: page,
    });
  };

  render() {
    const { location: { query: { current } } } = this.props;
    const { data, orderData, currentPage } = this.state;
    const houseGarbageColumns = [
      {
        title: '排名',
        dataIndex: 'idx',
        key: 'idx',
        render: (text, record, idx) => (<span>{idx + 1}</span>),
      },
      {
        title: '回收类目',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text, record) => <span>{record.parentName}-{text}</span>,
      },
      {
        title: '回收重量',
        dataIndex: 'sum',
        key: 'sum',
        render: (text, record) => <span>{text}{record.unit}</span>,
      },
    ];
    const abandoneAppliancesColumns = [
      {
        title: '排名',
        dataIndex: 'idx',
        key: 'idx',
        render: (text, record, idx) => (<span>{idx + 1}</span>),
      },
      {
        title: '回收类目',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text, record) => <span>{record.parentName}-{text}</span>,
      },
      {
        title: '回收数量',
        dataIndex: 'sum',
        key: 'sum',
        render: (text, record) => <span>{text}{record.unit}</span>,
      },
    ];
    const orderColumns = [
      {
        title: '排名',
        dataIndex: 'idx',
        key: 'idx',
        render: (text, record, idx) => (<span>{idx + 1}</span>),
      },
      {
        title: '回收员姓名',
        dataIndex: 'recycleName',
        key: 'recycleName',
      },
      {
        title: '联系电话',
        dataIndex: 'contactTel',
        key: 'contactTel',
      },
      {
        title: '完成订单数',
        dataIndex: 'orderCounts',
        key: 'orderCounts',
      },
      {
        title: '产生服务商积分',
        dataIndex: 'companyPoints',
        key: 'companyPoints',
      },
      {
        title: '支出回收物资',
        dataIndex: 'recycleMaterial',
        key: 'recycleMaterial',
        render: text => <span>￥{text}</span>
      },
      {
        title: '支出平台信息费',
        dataIndex: 'platformFee',
        key: 'platformFee',
        render: text => <span>￥{text}</span>
      },
    ];
    // 数据统计
    const pointData = data.recoveryStatistics;
    // 生活垃圾列表数据
    const HouseholdList = data.householdList;
    // 废弃家电列表数据
    const AbandonedList = data.abandonedList;

    const paginationProps = {
      total: orderData.totalCounts ? orderData.totalCounts : 0,
      pageSize: 10,
      current: currentPage,
      onChange: this.handlePageChange,
    };

    return (
      <PageHeaderWrapper extra={[
        <Button
          type='primary'
          onClick={() => history.push(`/fixedTime/offlineManage?current=${current}`)}>
          返回
        </Button>,
      ]}>
        <Row gutter={16} className={styles.statistics}>
          <Col span={6}>
            <Card className={styles.card}>
              <Statistic title='订单总数' value={pointData && pointData.totalOrders}/>
              <Divider/>
              <span>服务用户数&emsp;{pointData && pointData.servedUsers}</span>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.card}>
              <span className={styles.cardSpan}>回收总量</span><br/>
              <span
                className={styles.category}>生活垃圾：{pointData && (pointData.householdGarbage + 'kg') || '/'}</span><br/>
              <span
                className={styles.category}>废弃家电：{pointData && (pointData.abandonedHomeAppliances + '台') || '/'}</span>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.card}>
              <Statistic
                title={<span>产生积分数&nbsp;<Tooltip title='该数据仅统计服务商积分'><QuestionCircleOutlined/></Tooltip></span>}
                value={pointData && pointData.generatePoints}/>
              <span className={styles.category}>￥{pointData && pointData.generateMoney}</span>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.card}>
              <span className={styles.cardSpan}>交易金额&nbsp;<Tooltip
                title='交易金额针对回收点统计，包含服务商支付金额及回收人员支付金额'><QuestionCircleOutlined/></Tooltip></span><br/>
              <span className={styles.category}>
                回收物资：{pointData && ('￥' + pointData.recycledMaterial) || '/'}
              </span><br/>
              <span className={styles.category}>
                平台信息费：{pointData && ('￥' + pointData.platformInformationFee) || '/'}
              </span>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '10px' }}>
          <Col span={12}>
            <Card title={<span>生活垃圾回收总量统计</span>}>
              <Table
                columns={houseGarbageColumns}
                dataSource={HouseholdList}/>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<span>废弃家电回收总量统计</span>}>
              <Table
                columns={abandoneAppliancesColumns}
                dataSource={AbandonedList}/>
            </Card>
          </Col>
        </Row>
        <Card title='订单交易统计' style={{ marginTop: '10px' }}>
          <Table
            columns={orderColumns}
            dataSource={orderData.list}
            pagination={paginationProps}
            footer={() => <span>总共{orderData.totalCounts}个回收人员</span>}/>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Index;
