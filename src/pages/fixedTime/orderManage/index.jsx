import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Form, Button, Row, Col, Input, Select, DatePicker, Table, message } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { history, Link } from 'umi';
import { connect } from 'dva';
import md5 from 'md5';
import _ from 'lodash';
import moment from 'moment';
import styles from './index.less'

const { Item: FormItem } = Form;
const { RangePicker } = DatePicker;
const { Option } = Select;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
  loading: loading.effects['fixedTime/getOrderList'],
}))
class Index extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      listData: {},
      initialParams: {
        app_key: 'app_id_3',
        name: 'business.order.getOrderLists',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      formValue: {},   // 查询条件
      current: 1,
      size: 10
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
    const { location: { query: { current } } } = this.props;
    const { initialParams, size } = this.state;
    const payload = {
      ...initialParams,
      data: {
        pageBean: {
          pageNumber: current ? current : 1,
          pageSize: size,
        },
      },
    };
    this.loadListData(payload);
    current && this.setState({ current });
  };

  loadListData = (params) => {
    const { dispatch } = this.props;
    const Params = _.cloneDeepWith(params);
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    delete Params.data.pageBean;
    dispatch({
      type: 'fixedTime/getOrderList',
      payload: {
        ...params,
        nonce: signnonce,
        timestamp: `${new Date().valueOf()}`,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          this.setState({
            listData: res.data,
            formValue: Params.data,
          });
        }
      }
    });
  };

  queryCondition = () => {
    const { searchOpen } = this.state;
    this.setState({ searchOpen: !searchOpen });
  };

  // 查询
  onSearch = (values) => {
    const { initialParams, size } = this.state;
    const Time = values.time;
    const Values = _.cloneDeepWith(values);
    delete Values.time;
    const params = {
      ...initialParams,
      data: {
        ...Values,
        startTime: Time && Time[0].format('YYYY-MM-DD'),
        endTime: Time && Time[1].format('YYYY-MM-DD'),
        pageBean: {
          pageNumber: 1,
          pageSize: size,
        },
      },
    };
    this.loadListData(params);
  };

  // 重置
  reset = () => {
    const { initialParams, size } = this.state;
    const params = {
      ...initialParams,
      data: {
        pageBean: {
          pageNumber: 1,
          pageSize: size,
        },
      },
    };
    this.loadListData(params);
    this.formRef.current.resetFields();
  };

  getCompanyId = () => {
    if (window.sessionStorage.getItem('CompanyId')) {
      return window.sessionStorage.getItem('CompanyId');
    } else {
      this.props.history.push('/user/login');
    }
  };

  export = () => {
    this.formRef.current.validateFields().then(values => {
      const { time } = values;
      const conditions = [];
      _.map(values, (item, k) => {
        if (k !== 'time' && (item || item === 0)) {
          const condition = '&' + k + '=' + item;
          conditions.push(condition);
        }
      });

      const startTime = time && time[0].format('YYYY-MM-DD');
      const endTime = time && time[1].format('YYYY-MM-DD');
      if (!time) {
        message.warning('请选择时间');
      } else {
        window.location.href = `https://ding.mayishoubei.com/out/excel/businessOrderList?companyId=${this.getCompanyId()}&startTime=${startTime}&endTime=${endTime}${_.join(conditions, '')}`;
      }
    });
  };

  disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };

  // 简单条件
  renderSimpleCondition = () => {
    return (
      <Form onFinish={this.onSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='订单编号' name='orderNo'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='用户信息' name='linkName'>
              <Input placeholder='支持搜索姓名或手机号'/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <Button type='primary' htmlType='submit'>查询</Button>&emsp;
            <Button type='primary' onClick={this.export}>导出</Button>&emsp;
            <Button onClick={this.reset}>重置</Button>&emsp;
            <Button type='link' onClick={this.queryCondition}>
              展开
              <a><DownOutlined style={{ fontSize: '10px' }}/></a>
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  // 完整条件
  renderCompleteCondition = () => {
    return (
      <Form onFinish={this.onSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='订单编号' name='orderNo'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='用户信息' name='linkName'>
              <Input placeholder='支持搜索姓名或手机号'/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='回收点名称' name='netName'>
              <Input/>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='回收员信息' name='recyclerName'>
              <Input placeholder='支持搜索姓名或手机号码'/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='回收物类型' name='title'>
              <Select>
                <Option>全部</Option>
                <Option value={2}>生活垃圾</Option>
                <Option value={1}>废弃家电</Option>
                <Option value={7}>生活垃圾/废弃家电</Option>
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='结算方式' name='payType'>
              <Select>
                <Option>全部</Option>
                <Option value={2}>蚂蚁森林能量</Option>
                <Option value={1}>环保积分</Option>
                <Option value={0}>卖钱</Option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='完成时间' name='time'>
              <RangePicker disabledDate={this.disabledDate}/>
            </FormItem>
          </Col>
          <Col sm={24} md={8} push={8}>
            <Button type='primary' htmlType='submit'>查询</Button>&emsp;
            <Button type='primary' onClick={this.export}>导出</Button>&emsp;
            <Button onClick={this.reset}>重置</Button>&emsp;
            <Button type='link' onClick={this.queryCondition}>
              收起
              <a><UpOutlined style={{ fontSize: '10px' }}/></a>
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  // 分页回调
  handlePageChange = (page) => {
    const { formValue, initialParams, size } = this.state;
    const Time = formValue.time;
    const params = {
      ...initialParams,
      data: {
        ...formValue,
        startTime: Time && Time[0].format('YYYY-MM-DD'),
        endTime: Time && Time[1].format('YYYY-MM-DD'),
        pageBean: {
          pageNumber: page,
          pageSize: size,
        },
      },
    };
    this.loadListData(params);
    this.setState({
      current: page,
    });
  };

  sizeChange = (current, size) => {
    const { initialParams } = this.state;
    const params = {
      ...initialParams,
      data: {
        pageBean: {
          pageNo: 1,
          pageSize: size,
        },
      },
    };
    this.loadListData(params);
    this.setState({
      size,
      current: 1
    })
  };

  render() {
    const { loading } = this.props;
    const { searchOpen, listData, current, size } = this.state;
    const columns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
      },
      {
        title: '订单编号',
        dataIndex: 'orderNo',
        key: 'orderNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '完成时间',
        dataIndex: 'completeDate',
        key: 'completeDate',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收物信息',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text, record) => {
          return (
            <span>{text}<br/><Link
              to={{
                pathname: '/fixedTime/orderManage/checkOutOrder',
                query: {
                  tabKey: '2',
                  id: record.id,
                  recyclerId: record.recyclerId,
                  netId: record.netId,
                  orderNo: record.orderNo,
                  payType: record.payType,
                  completeDate: record.completeDate,
                  userName: record.userName,
                  tel: record.tel,
                  recyclerName: record.recyclerName,
                  categoryName: record.categoryName,
                  current,
                },
              }}>查看详情</Link></span>
          )
        },
      },
      {
        title: '用户信息',
        dataIndex: 'userName',
        key: 'userName',
        render: (text, record) => <span>{text}<br/>{record.tel}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'netName',
        key: 'netName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收员信息',
        dataIndex: 'recyclerName',
        key: 'recyclerName',
        render: (text, record) => <span>{text || '/'}<br/>{record.mobile}</span>,
      },
      {
        title: '结算方式',
        dataIndex: 'payType',
        key: 'payType',
        render: (text) => {
          return (
            <span>
              {text === '0' ? '卖钱' : text === '1' ? '环保积分' : '蚂蚁森林能量'}
            </span>
          )
        },
      },
      {
        title: '操作',
        key: 'op',
        render: (_, record) => <Link
          to={{
            pathname: '/fixedTime/orderManage/checkOutOrder',
            query: {
              tabKey: '1',
              id: record.id,
              recyclerId: record.recyclerId,
              netId: record.netId,
              orderNo: record.orderNo,
              payType: record.payType,
              completeDate: record.completeDate,
              userName: record.userName,
              tel: record.tel,
              recyclerName: record.recyclerName,
              categoryName: record.categoryName,
              current,
            },
          }}>查看订单详情</Link>,
      },
    ];

    let list = [];
    if (listData.businessOrderBeanList) {
      list = listData.businessOrderBeanList.map((d, idx) => {
        // d.id = d.bmsah;
        d.rownumber = size * (current - 1) + idx + 1;
        return d;
      });
    }

    const totalPages = Math.ceil(listData && listData.pagination && listData.pagination.total/size);
    const paginationProps = {
      total: (listData && listData.pagination) ? listData.pagination.total : 0,
      pageSize: size,
      current: _.toNumber(current),
      onChange: this.handlePageChange,
      showTotal: (total) => `共${total}条记录 第${current}/${totalPages}页`,
      showQuickJumper: true,
      showSizeChanger: true,
      onShowSizeChange: this.sizeChange
    };

    return (
      <PageHeaderWrapper title='定时定点回收订单列表'>
        <div className={styles.content}>
          <Card>
            {searchOpen ? this.renderCompleteCondition() : this.renderSimpleCondition()}
          </Card>
          <Card style={{ marginTop: '10px' }}>
            <Table
              columns={columns}
              dataSource={list}
              pagination={paginationProps}
              loading={loading}/>
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Index;
