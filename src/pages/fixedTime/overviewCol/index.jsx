import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  Statistic,
  Row,
  Col,
  Divider,
  Card,
  Tooltip,
  Tabs,
  Form,
  DatePicker,
  Table,
  Select,
  message,
  Input,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { history } from 'umi';
import md5 from 'md5';
import _ from 'lodash';
import styles from './index.less';

const { TabPane } = Tabs;
const { Item: FormItem } = Form;
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
  overviewLoading: loading.effects['fixedTime/getStaticsData'],
}))
class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initialParams: {
        app_key: 'app_id_1',
        name: 'recycleStatistics.OverView',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      statisticData: {},
      overviewData: {},
      recycleData: {},
      overviewType: 1,      // 中间表格的type
      overviewCurrent: 1,
      recycleCurrent: 1,
      categoryData: {},
      categoryId: undefined,   // 类目id
      startDate: null,
      endDate: null,
    };
  }

  componentDidMount() {
    const overviewParams = {
      data: {
        pageNo: 1,
        pageSize: 10,
        types: 1,
      },
    };
    const recycleParams = {
      data: {
        pageNo: 1,
        pageSize: 10,
        categoryId: 25,
      },
    };
    this.loadStaticsData();
    this.loadOverviewData(overviewParams);
    this.loadRecycleData(recycleParams);
    this.loadCategoryData();
  }

  // 顶部统计数据
  loadStaticsData = () => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getStaticsData',
      payload: {
        ...initialParams,
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          statisticData: res.data,
        });
      } else {
        message.error('数据获取失败！');
      }
    });
  };

  // 中部表格
  loadOverviewData = (params) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getStaticsData',
      payload: {
        ...initialParams,
        name: 'recycleStatistics.OverViewList',
        ...params,
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          overviewData: res.data,
        });
      } else {
        message.error('数据获取失败！');
      }
    });
  };

  // 回收点表格
  loadRecycleData = (params) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getStaticsData',
      payload: {
        ...initialParams,
        name: 'recycleStatistics.OverViewTypeList',
        ...params,
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          recycleData: res.data,
        });
      } else {
        message.error('数据获取失败！');
      }
    });
  };

  // 类目数据
  loadCategoryData = () => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getCategory',
      payload: {
        ...initialParams,
        name: 'recyclePosition.category.get',
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          categoryData: res.data,
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

  // 订单数
  getOrderColumns = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '订单总数',
        dataIndex: 'orderCounts',
        key: 'orderCounts',
        render: (text) => <span>{text || '/'}</span>,
      },
    ];
    return columns;
  };

  // 积分数
  getPointColumns = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '积分总数',
        dataIndex: 'companyPoints',
        key: 'companyPoints',
        render: (text) => <span>{text || '/'}</span>,
      },
    ];
    return columns;
  };

  // 回收物资
  getRecycleColumns = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收物资总数',
        dataIndex: 'recycleMaterial',
        key: 'recycleMaterial',
        render: (text) => <span>{text || '/'}</span>,
      },
    ];
    return columns;
  };

  // 平台信息费
  getPlatInfoColumns = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '平台信息费总数',
        dataIndex: 'platformFee',
        key: 'platformFee',
        render: (text) => <span>{text || '/'}</span>,
      },
    ];
    return columns;
  };

  // 回收点回收量排名
  getRecycleRankColumns = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rowNum',
        key: 'rowNum',
      },
      {
        title: '回收点编号',
        dataIndex: 'positionNo',
        key: 'positionNo',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收点名称',
        dataIndex: 'positionName',
        key: 'positionName',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收类目',
        dataIndex: 'recycleType',
        key: 'recycleType',
        render: (text) => <span>{text || '/'}</span>,
      },
      {
        title: '回收量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (text, record) => {
          return (text ? <span>{text}{record.unit}</span> : <span>/</span>);
        },
      },
    ];
    return columns;
  };

  statistical = (dates, dateStrings) => {
    const { overviewType } = this.state;
    const params = {
      data: {
        pageNo: 1,
        pageSize: 10,
        types: overviewType,
        startDate: dates && dateStrings[0],
        endDate: dates && dateStrings[1],
      },
    };
    this.loadOverviewData(params);
    this.setState({
      startDate: dates && dateStrings[0],
      endDate: dates && dateStrings[1],
    });
  };

  changeListData = (key) => {
    const { startDate, endDate } = this.state;
    const params = {
      data: {
        pageNo: 1,
        pageSize: 10,
        types: key,
        startDate,
        endDate,
      },
    };
    this.loadOverviewData(params);
    this.setState({
      overviewType: key,
    });
  };

  handleOverviewChange = (page) => {
    const { overviewType } = this.state;
    const params = {
      data: {
        pageNo: page,
        pageSize: 10,
        types: overviewType,
      },
    };
    this.loadOverviewData(params);
    this.setState({
      overviewCurrent: page,
    });
  };

  handleRecycleChange = (page) => {
    const { categoryId } = this.state;
    const params = {
      data: {
        pageNo: page,
        pageSize: 10,
        categoryId: categoryId,
      },
    };
    this.loadRecycleData(params);
    this.setState({
      recycleCurrent: page,
    });
  };

  categorySearch = (value) => {
    const params = {
      data: {
        pageNo: 1,
        pageSize: 10,
        categoryId: value,
      },
    };
    this.setState({
      categoryId: value,
    });
    this.loadRecycleData(params);
  };

  render() {
    const { overviewLoading } = this.props;
    const { statisticData, overviewData, recycleData, overviewCurrent, recycleCurrent, categoryData } = this.state;
    const Statistics = statisticData.statistics;
    const OverviewData = overviewData.result;
    const RecycleData = recycleData.result;
    const statistical = (<FormItem label='统计时段'><RangePicker onChange={this.statistical}/></FormItem>);

    const Household = categoryData.household;   // 生活垃圾
    const huoseRootCategory = [];   // 生活垃圾的主类目
    _.map(Household, item => {
      const Item = {};
      _.set(Item, 'name', item.rootCategoryName);
      _.set(Item, 'id', item.id);
      huoseRootCategory.push(Item);
    });

    const Abandoned = categoryData.abandoned;   // 废弃家电
    const abandonedRootCategory = [];   // 废弃家电的主类目
    _.map(Abandoned, item => {
      const Item = {};
      _.set(Item, 'name', item.rootCategoryName);
      _.set(Item, 'id', item.id);
      abandonedRootCategory.push(Item);
    });

    const recycleCategory = (
      <FormItem label='回收类目'>
        <Select
          style={{ width: 150 }}
          showSearch
          optionFilterProp='children'
          defaultValue={huoseRootCategory[0] && huoseRootCategory[0].id}
          key={huoseRootCategory[0] && huoseRootCategory[0].id}
          onChange={this.categorySearch}>
          <OptGroup label='生活垃圾'>
            {
              _.map(huoseRootCategory, item => {
                return <Option value={item.id}>{item.name}</Option>;
              })
            }
          </OptGroup>
          <OptGroup label='废弃家电'>
            {
              _.map(abandonedRootCategory, item => {
                return <Option value={item.id}>{item.name}</Option>;
              })
            }
          </OptGroup>
        </Select>
      </FormItem>
    );

    const paginationProps = {
      total: (OverviewData && OverviewData.totalCounts) ? OverviewData.totalCounts : 0,
      pageSize: 10,
      current: overviewCurrent,
      onChange: this.handleOverviewChange,
      showSizeChanger: false,
    };
    const recyclePagination = {
      total: (RecycleData && RecycleData.totalCounts) ? RecycleData.totalCounts : 0,
      pageSize: 10,
      current: recycleCurrent,
      onChange: this.handleRecycleChange,
      showSizeChanger: false,
    };

    return (
      <PageHeaderWrapper
        extra={[
          <Row>
            <Col span={6}>
              <Statistic title='回收点总数' value={Statistics && Statistics.positionCounts}/>
            </Col>
            <Divider type='vertical' className={styles.dividerSty}/>
            <Col span={6}>
              <Statistic title='订单总数' value={Statistics && Statistics.totalOrders}/>
            </Col>
            <Divider type='vertical' className={styles.dividerSty}/>
            <Col span={6}>
              <Statistic title='服务用户数' value={Statistics && Statistics.servedUsers}/>
            </Col>
          </Row>,
        ]}>
        <Row gutter={16} className={styles.total}>
          <Col span={8}>
            <Card className={styles.card}>
              <span className={styles.cardSpan}>回收总量</span><br/>
              <span
                className={styles.category}>生活垃圾：{Statistics && (Statistics.householdGarbage).toFixed(2) + 'kg' || '/'}</span><br/>
              <span
                className={styles.category}>废弃家电：{Statistics && (Statistics.abandonedHomeAppliances + '台') || '/'}</span>
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.card}>
              <Statistic
                title={<span>产生积分数&nbsp;<Tooltip title='仅统计回收点产生的服务商积分'><QuestionCircleOutlined/></Tooltip></span>}
                value={Statistics && Statistics.generatePoints}/>
              <span className={styles.category}>￥{Statistics && (Statistics.generateMoney).toFixed(2) || 0}</span>
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.card}>
              <span className={styles.cardSpan}>交易金额&nbsp;<Tooltip
                title='包含服务商支付金额及回收人员支付金额'><QuestionCircleOutlined/></Tooltip></span><br/>
              <span
                className={styles.category}>回收物资：￥{Statistics && (Statistics.recycledMaterial).toFixed(2) || '/'}</span><br/>
              <span
                className={styles.category}>平台信息费：￥{Statistics && (Statistics.platformInformationFee).toFixed(2) || '/'}</span>
            </Card>
          </Col>
        </Row>
        <Card className={styles.table}>
          <Tabs defaultActiveKey={1} tabBarExtraContent={statistical} onChange={this.changeListData}>
            <TabPane tab='订单数' key={1}>
              <div className={styles.headTitle}>
                <span>订单总数：</span>
                <span>{OverviewData && OverviewData.sum || 0}</span>
              </div>
              <Table
                columns={this.getOrderColumns()}
                loading={overviewLoading}
                dataSource={OverviewData && OverviewData.pageList}
                pagination={paginationProps}/>
            </TabPane>
            <TabPane tab='积分数' key={2}>
              <div className={styles.headTitle}>
                <span>积分总数：</span>
                <span>{OverviewData && OverviewData.sum || 0}</span>
              </div>
              <Table
                columns={this.getPointColumns()}
                loading={overviewLoading}
                dataSource={OverviewData && OverviewData.pageList}
                pagination={paginationProps}/>
            </TabPane>
            <TabPane tab='回收物资' key={3}>
              <div className={styles.headTitle}>
                <span>回收物资总数：</span>
                <span>￥{OverviewData && OverviewData.sum || 0}</span>
              </div>
              <Table
                columns={this.getRecycleColumns()}
                loading={overviewLoading}
                dataSource={OverviewData && OverviewData.pageList}
                pagination={paginationProps}/>
            </TabPane>
            <TabPane tab='平台信息费' key={4}>
              <div className={styles.headTitle}>
                <span>平台信息费总数：</span>
                <span>￥{OverviewData && OverviewData.sum || 0}</span>
              </div>
              <Table
                columns={this.getPlatInfoColumns()}
                loading={overviewLoading}
                dataSource={OverviewData && OverviewData.pageList}
                pagination={paginationProps}/>
            </TabPane>
          </Tabs>
        </Card>
        <Card className={styles.table}>
          <Tabs defaultActiveKey={1} tabBarExtraContent={recycleCategory}>
            <TabPane tab='回收点回收量排名' key={1}>
              <div className={styles.headTitle}>
                <span>回收总量：</span>
                <span>
                  {RecycleData && RecycleData.sum}{RecycleData && RecycleData.unit}
                </span>
              </div>
              <Table
                columns={this.getRecycleRankColumns()}
                dataSource={RecycleData && RecycleData.pageList}
                pagination={recyclePagination}/>
            </TabPane>
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Index;
