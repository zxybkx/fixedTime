import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Row, Col, Form, Input, Button, DatePicker, Statistic, Divider, Table } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { history } from 'umi';
import md5 from 'md5';
import _ from 'lodash';
import styles from './index.less';

const { Item: FormItem } = Form;
const { RangePicker } = DatePicker;

@connect(({ fixedTime }) => ({
  fixedTime,
}))
class PointDetail extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      initialParams: {
        app_key: 'app_id_1',
        name: 'serviceProvider.integral.details',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      formValues: {},
      data: {},
      current: 1,
      size: 10,
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
    const { size } = this.state;
    const params = {
      data: {
        pageNo: 1,
        pageSize: size,
      },
    };
    this.loadData(params);
  }

  loadData = (params) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getIntergralDetail',
      payload: {
        ...initialParams,
        ...params,
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        delete params.data.pageNo;
        delete params.data.pageSize;
        this.setState({
          data: res.data,
          formValues: params.data,
        });
      }
    });
  };

  queryCondition = () => {
    const { searchOpen } = this.state;
    this.setState({
      searchOpen: !searchOpen,
    });
  };

  onSearch = (values) => {
    const { size } = this.state;
    const Values = _.cloneDeepWith(values);
    delete Values.time;
    const params = {
      data: {
        pageNo: 1,
        pageSize: size,
        ...Values,
        startDate: values.time && values.time[0].format('YYYY-MM-DD'),
        endDate: values.time && values.time[1].format('YYYY-MM-DD'),
      },
    };
    this.loadData(params);
    this.setState({
      current: 1,
    });
  };

  resetFields = () => {
    const { size } = this.state;
    const params = {
      data: {
        pageNo: 1,
        pageSize: size,
      },
    };
    this.loadData(params);
    this.setState({
      current: 1,
    });
    this.formRef.current.resetFields();
  };

  renderSimpleCondition = () => {
    return (
      <Form onFinish={this.onSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={6}>
            <FormItem label='卡号' name='cardNo'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={6}>
            <FormItem label='用户信息' name='userInfo'>
              <Input placeholder='支持搜索姓名或手机号'/>
            </FormItem>
          </Col>
          <Col sm={24} md={6}>
            <FormItem label='回收员姓名' name='recycleName'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={6}>
            <Button type='primary' htmlType='submit'>查询</Button>&emsp;
            <Button onClick={this.resetFields}>重置</Button>&emsp;
            <Button type='link' onClick={this.queryCondition}>
              展开
              <a><DownOutlined style={{ fontSize: '10px' }}/></a>
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  renderCompleteCondition = () => {
    return (
      <Form onFinish={this.onSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='卡号' name='cardNo'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='用户信息' name='userInfo'>
              <Input placeholder='支持搜索姓名或手机号'/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='回收员姓名' name='recycleName'>
              <Input/>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='变更时间' name='time'>
              <RangePicker/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='回收点名称' name='positionName'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <Button type='primary' htmlType='submit'>查询</Button>&emsp;
            <Button onClick={this.resetFields}>重置</Button>&emsp;
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
    const { formValues, initialParams, size } = this.state;
    const params = {
      ...initialParams,
      data: {
        ...formValues,
        pageNo: page,
        pageSize: size,
      },
    };
    this.loadData(params);
    this.setState({
      current: page,
    });
  };

  sizeChange = (current, size) => {
    const { initialParams } = this.state;
    const params = {
      ...initialParams,
      data: {
        pageNo: 1,
        pageSize: size,
      },
    };
    this.loadData(params);
    this.setState({
      size,
      current: 1,
    });
  };

  render() {
    const { searchOpen, data, current, size } = this.state;
    const columns = [
      {
        title: '序号',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '积分变更时间',
        dataIndex: 'createDate',
        key: 'createDate',
      },
      {
        title: '卡号',
        dataIndex: 'cardNo',
        key: 'cardNo',
      },
      {
        title: '用户信息',
        dataIndex: 'telephone',
        key: 'telephone',
        render: (text, record) => {
          if (text || record.name) {
            return <span>{record.name}<br/>{text}</span>;
          }
          return <span>/</span>;
        },
      },
      {
        title: '订单编号',
        dataIndex: 'orderCode',
        key: 'orderCode',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收员姓名',
        dataIndex: 'recycleName',
        key: 'recycleName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '积分明细',
        dataIndex: 'operatePoint',
        key: 'operatePoint',
        render: (text) => <span>{text || '/'}</span>,
      },
    ];
    const jfInfo = data.JFInfo;
    const dataSource = jfInfo && jfInfo.list;

    const totalPages = Math.ceil(jfInfo && jfInfo.totalCounts / size);
    const paginationProps = {
      total: (jfInfo && jfInfo.totalCounts) ? jfInfo.totalCounts : 0,
      pageSize: size,
      current,
      onChange: this.handlePageChange,
      showTotal: (total) => `共${total}条记录 第${current}/${totalPages}页`,
      showQuickJumper: true,
      showSizeChanger: true,
      onShowSizeChange: this.sizeChange,
    };

    return (
      <PageHeaderWrapper title='服务商积分明细'>
        <div className={styles.content}>
          <Card>
            {searchOpen ? this.renderCompleteCondition() : this.renderSimpleCondition()}
          </Card>
          <Card style={{ marginTop: '10px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title='累计增加积分' value={jfInfo && jfInfo.plusPoints || 0}/>
              </Col>
              <Col span={5}>
                <Statistic title='累计增加积分金额（元）' value={jfInfo && jfInfo.plusMoney || 0} prefix='￥'/>
              </Col>
              <Col span={2}>
                <Divider type='vertical' style={{ height: '60px', background: '#363636' }}/>
              </Col>
              <Col span={5}>
                <Statistic title='累计消耗积分' value={jfInfo && jfInfo.subPoints || 0}/>
              </Col>
              <Col span={6}>
                <Statistic title='累计消耗积分金额（元）' value={jfInfo && jfInfo.subMoney || 0} prefix='￥'/>
              </Col>
            </Row>
          </Card>
          <Card style={{ marginTop: '10px' }}>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={paginationProps}/>
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default PointDetail;
