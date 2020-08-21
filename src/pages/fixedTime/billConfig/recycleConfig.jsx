import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Tabs, Card, Table, InputNumber, Modal, Form, Input, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { connect } from 'dva';
import md5 from 'md5';
import _ from 'lodash';
import styles from './recycle.less';

const { TabPane } = Tabs;
const { Item: FormItem } = Form;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
  loading: loading.effects['fixedTime/configurationPoints'],
}))

class RecycleConfig extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pointVisible: false,
      initialParams: {
        app_key: 'app_id_3',
        name: 'business.company.getCategoryAndPointByTitle',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      tabKey: 1,
      value: null,
      recycleData: {},
    };
  }

  componentDidMount() {
    this.loadData(1);
  }

  loadData = (key) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getListData',
      payload: {
        data: {
          title: key,
        },
        nonce: signnonce,
        timestamp: `${new Date().valueOf()}`,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
        ...initialParams,
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          recycleData: res.data
        })
      }
    })
  };

  tabChange = (key) => {
    this.loadData(key);
    this.setState({
      tabKey: key,
      value: null
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

  iconClick = () => {
    this.setState({
      pointVisible: true,
    });
  };

  configPoint = (val, record) => {
    const { dispatch } = this.props;
    const { initialParams, tabKey, value, recycleData } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    let Payload;
    if (record) {
      // 单条保存
      Payload = {
        data: {
          'companyCategoryList': [
            {
              categoryId: record.categoryId,
              categoryName: record.categoryName,
              point: val,
              parentId: record.parentId,
              parentName: record.parentName,
              unit: record.unit,
            },
          ],
        },
        ...initialParams,
        nonce: signnonce,
        name: 'business.company.saveOrUpdateCompanyPonit',
        timestamp: `${new Date().valueOf()}`,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      };
      this.setState({
        pointVisible: false,
      });
      dispatch({
        type: 'fixedTime/configurationPoints',
        payload: Payload,
      });
    } else {
      // 多条保存
      const jsonData = [];
      _.map(recycleData, item => {
        _.map(item.companyCategoryList, i => {
          const param = {};
          _.set(param, 'categoryId', i.categoryId);
          _.set(param, 'point', value);
          _.set(param, 'parentId', i.parentId);
          _.set(param, 'parentName', i.parentName);
          _.set(param, 'categoryName', i.categoryName);
          _.set(param, 'unit', i.unit);

          jsonData.push(param);
        });
      });

      Payload = {
        data: {
          'companyCategoryList': jsonData,
        },
        ...initialParams,
        nonce: signnonce,
        name: 'business.company.saveOrUpdateCompanyPonit',
        timestamp: `${new Date().valueOf()}`,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      };
      dispatch({
        type: 'fixedTime/configurationPoints',
        payload: Payload,
      }).then(() => {
        this.loadData(tabKey);
      });
    }
  };

  getValue = (value) => {
    this.setState({value});
  };

  onOk = () => {
    this.configPoint();
    this.onCancel();
  };

  onCancel = () => {
    this.setState({ pointVisible: false });
  };

  getColumns = () => {
    const { pointVisible } = this.state;
    const columns = [
      {
        title: '品类名称',
        dataIndex: 'categoryName',
        key: 'categoryId',
      },
      {
        title: () => {
          return (
            pointVisible ?
              <div>
                <span>积分</span>&emsp;
                <InputNumber precision={0}
                             min={0}
                             onChange={(value) => this.getValue(value, null)}/>&emsp;
                <Button type='primary' onClick={this.onOk}>确定</Button>&emsp;
                <Button onClick={this.onCancel}>取消</Button>
              </div> :
              <div>
                <span>积分</span>&emsp;
                <a onClick={this.iconClick}>
                  <EditOutlined/>
                </a>
              </div>
          );
        },
        dataIndex: 'point',
        key: 'categoryId',
        render: (text, record) => {
          if (!record.children) {
            return (
              <InputNumber precision={0} min={0} defaultValue={text} key={text}
                           onChange={(value) => this.configPoint(value, record)}/>
            );
          }
        },
      },
    ];
    return columns;
  };

  render() {
    const { loading } = this.props;
    const {recycleData} = this.state;
    const jsonData = [];
    _.map(recycleData, item => {
      const itemData = {};
      _.set(itemData, 'categoryId', item.parentId);
      _.set(itemData, 'key', item.parentId);
      _.set(itemData, 'categoryName', item.parentName);
      _.set(itemData, 'children', item.companyCategoryList);
      jsonData.push(itemData);
    });

    return (
      <PageHeaderWrapper extra={[
        <Button
          type='primary'
          onClick={() => history.push(`/fixedTime/billConfig`)}>
          返回
        </Button>,
      ]} subTitle='此页面配置定时定点服务商积分'>
        <Card className={styles.content}>
          <Tabs defaultActiveKey={1} onChange={this.tabChange}>
            <TabPane tab='废弃家电' key={1}>
              <Table
                columns={this.getColumns()}
                dataSource={jsonData}
                pagination={false} loading={loading}/>
            </TabPane>
            <TabPane tab='生活垃圾' key={2}>
              <Table
                columns={this.getColumns()}
                dataSource={jsonData}
                pagination={false} loading={loading}/>
            </TabPane>
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RecycleConfig;
