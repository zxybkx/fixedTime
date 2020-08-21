import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Row, Col, Form, Input, Select, Button, Table, Switch, Cascader, Popconfirm, message } from 'antd';
import { DownOutlined, UpOutlined, PlusOutlined } from '@ant-design/icons';
import { history, Link } from 'umi';
import { connect } from 'dva';
import md5 from 'md5';
import _ from 'lodash';
import styles from './index.less'

const { Item: FormItem } = Form;
const { Option } = Select;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
  loading: loading.effects['fixedTime/getOfflineList'],
}))
class OfflineManage extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      initialParams: {
        app_key: 'app_id_1',
        name: 'recyclePosition.list',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      formValues: {},
      listData: {},
      current: 1,
      areaList: [],
      streetList: [],
      size: 10,
    };
  }

  componentDidMount() {
    const { location: { query: { current } } } = this.props;
    const { size } = this.state;
    const params = {
      data: {
        pageNo: current ? current : 1,
        pageSize: size,
      },
    };
    this.loadList(params);
    this.loadArea(0);
    current && this.setState({ current });
  }

  loadArea = (id, options) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getAreaList',
      payload: {
        ...initialParams,
        name: 'area.getList.byParentId',
        data: options ? { id } : { parentId: id },
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          if (options) {
            this.setState({
              streetList: res.data && res.data.areaList,
            });
          } else {
            this.setState({
              areaList: res.data && res.data.areaList,
            });
          }
        }
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

  loadList = (params) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getOfflineList',
      payload: {
        ...params,
        ...initialParams,
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          delete params.data.pageNo;
          delete params.data.pageSize;
          this.setState({
            listData: res.data,
            formValues: params.data,
          });
        }
      }
    });
  };

  queryCondition = () => {
    const { searchOpen } = this.state;
    this.setState({
      searchOpen: !searchOpen,
    });
  };

  handleSearch = (values) => {
    const { initialParams, size } = this.state;
    const params = {
      ...initialParams,
      data: {
        pageNo: 1,
        pageSize: size,
        dsddRecyclePosition: { ...values },
        locationArea: _.join(_.concat(values.locationArea, values.street), ''),
      },
    };

    this.loadList(params);
    this.setState({
      current: 1,
    });
  };

  reset = () => {
    const { initialParams } = this.state;
    const params = {
      ...initialParams,
      data: {
        pageNo: 1,
        pageSize: 10,
      },
    };
    this.loadList(params);
    this.formRef.current.resetFields();
    this.setState({
      current: 1,
    });
  };

  renderSimpleCondition = () => {
    return (
      <Form onFinish={this.handleSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='回收点名称' name='positionName'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='启用状态' name='isEnable'>
              <Select>
                <Option value={1}>启用</Option>
                <Option value={0}>不启用</Option>
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <Button type='primary' htmlType='submit'>查询</Button>
            <Button style={{ marginLeft: '8px' }} onClick={this.reset}>重置</Button>
            <Button type='link' onClick={this.queryCondition}>
              展开
              <a><DownOutlined style={{ fontSize: '10px' }}/></a>
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  areaChange = (values, options) => {
    if (values.length === 3) {
      this.loadArea(options[2].id, options);
    }
  };

  renderCompleteCondition = () => {
    const { areaList, streetList } = this.state;

    return (
      <Form onFinish={this.handleSearch} ref={this.formRef}>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='回收点名称' name='positionName'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='启用状态' name='isEnable'>
              <Select>
                <Option value={1}>启用</Option>
                <Option value={0}>不启用</Option>
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='联系电话' name='contactTel'>
              <Input/>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col sm={24} md={8}>
            <FormItem label='回收点地址' name='address'>
              <Input/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='区域选择' name='locationArea'>
              <Cascader
                options={areaList}
                onChange={this.areaChange}
                changeOnSelect/>
            </FormItem>
          </Col>
          <Col sm={24} md={8}>
            <FormItem label='街道选择' name='street'>
              <Cascader
                options={streetList}
                changeOnSelect/>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={24} md={8} push={16}>
            <Button type='primary' htmlType='submit'>查询</Button>
            <Button style={{ marginLeft: '8px' }} onClick={this.reset}>重置</Button>
            <Button type='link' onClick={this.queryCondition}>
              收起
              <a><UpOutlined style={{ fontSize: '10px' }}/></a>
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  StateChange = (checked, id) => {
    const { dispatch, location: { query: { current } } } = this.props;
    const { initialParams, current: Current, size } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    const params = {
      data: {
        pageNo: current ? current : Current,
        pageSize: size,
      },
    };

    dispatch({
      type: 'fixedTime/changeState',
      payload: {
        ...initialParams,
        name: 'recyclePosition.isEnable.Edit',
        data: {
          id,
          isEnable: checked ? 1 : 0,
        },
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.loadList(params);
      } else {
        message.error('状态修改失败');
      }
    });
  };

  confirm = (checked, id) => {
    this.StateChange(checked, id);
  };

  getColumns = () => {
    const { current } = this.state;
    const columns = [
      {
        title: '序号',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
      },
      {
        title: '联系电话',
        dataIndex: 'contactTel',
        key: 'contactTel',
      },
      {
        title: '回收点地址',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
      },
      {
        title: '启用状态',
        dataIndex: 'isEnable',
        key: 'isEnable',
        render: (text, record) => {
          if (text === '0') {
            return (
              <Switch
                checkedChildren='开'
                unCheckedChildren='关'
                defaultChecked={text === '1' && true}
                onChange={(checked) => this.StateChange(checked, record.id)}/>
            );
          }
          return (
            <Popconfirm
              title='确定要关闭改回收点吗？'
              onConfirm={() => this.confirm(false, record.id)}
              // onCancel={this.cancel}
              okText='确定'
              cancelText='取消'>
              <Switch
                checkedChildren='开'
                unCheckedChildren='关'
                checked={text === '1' && true}
                // onChange={(checked) => this.StateChange(checked, record.id)}
              />
            </Popconfirm>
          );
        },
      },
      {
        title: '操作',
        key: 'op',
        render: (text, record) => (
          <div>
            <Link to={`/fixedTime/offlineManage/editCollectionPoint?id=${record.id}&current=${current}`}>编辑</Link>&emsp;
            <Link to={`/fixedTime/offlineManage/checkOut?id=${record.id}&current=${current}`}>查看</Link>&emsp;
            <Link to={`/fixedTime/offlineManage/statistics?id=${record.id}&current=${current}`}>回收统计</Link>
          </div>
        ),
      },
    ];
    return columns;
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
    this.loadList(params);
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
    this.loadList(params);
    this.setState({
      size,
      current: 1,
    });
  };

  render() {
    const { searchOpen, listData, current, size } = this.state;
    const totalPages = Math.ceil(listData && listData.totalCounts / size);
    const paginationProps = {
        total: (listData && listData.totalCounts) ? listData.totalCounts : 0,
        pageSize: size,
        current: _.toNumber(current),
        onChange: this.handlePageChange,
        showTotal: (total) => `共${total}条记录 第${current}/${totalPages}页`,
        showQuickJumper: true,
        showSizeChanger: true,
        onShowSizeChange: this.sizeChange,
      }
    ;

    return (
      <PageHeaderWrapper>
        <div className={styles.content}>
          <Card>
            {searchOpen ? this.renderCompleteCondition() : this.renderSimpleCondition()}
          </Card>
          <Card style={{ marginTop: '10px' }}>
            <Link to='/fixedTime/offlineManage/addCollectionPoint'>
              <Button type='dashed' icon={<PlusOutlined/>} style={{ width: '100%' }}>
                添加回收点
              </Button>
            </Link>
            <Table
              style={{ marginTop: '20px' }}
              columns={this.getColumns()}
              rowKey={record => record.id}
              dataSource={listData.list}
              pagination={paginationProps}/>
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default OfflineManage;
