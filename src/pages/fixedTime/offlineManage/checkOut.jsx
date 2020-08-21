import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Descriptions, Divider, Button, Radio, Row, Col } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import md5 from 'md5';
import _ from 'lodash';
import styles from './index.less';

const { Item: DescriptionsItem } = Descriptions;
const { Group: RadioGroup } = Radio;
const { Button: RadioButton } = Radio;

@connect(({ fixedTime }) => ({
  fixedTime,
}))
class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initialParams: {
        app_key: 'app_id_1',
        name: 'recyclePosition.view',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      data: {},
      value: 1,    // 回收类目及价格中的回收类型
      category: undefined,      // 当前的回收价格数据
      currentCategory: null,
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
      type: 'fixedTime/recycleView',
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
      }
    });
  }

  changeType = (e) => {
    this.setState({
      value: e.target.value,
      category: undefined,
      currentCategory: null,
    });
  };

  changeCategory = (e) => {
    const { data, value } = this.state;
    const typeData = value === 1 ? data.household : data.abandoned;

    _.map(typeData, item => {
      if (item.rootCategoryName === e.target.value) {
        this.setState({
          category: item.list,
        });
      }
    });
  };

  ejCategory = (e) => {
    this.setState({ currentCategory: e.target.value });
  };

  render() {
    const { location: { query: { id, current } } } = this.props;
    const { data, value, category, currentCategory } = this.state;
    const typeData = value === 1 ? data.household : data.abandoned;
    const { basicInfo } = data;
    const lengths = [];
    _.map(basicInfo && basicInfo.dsddOpeningHour, item => {
      const len = item.day.split(',').length;
      lengths.push(len);
    });
    const max = Math.max(...lengths);

    return (
      <PageHeaderWrapper
        onBack={() => history.push(`/fixedTime/offlineManage?current=${current}`)}
        extra={[
          <Button
            onClick={() => history.push(`/fixedTime/offlineManage/editCollectionPoint?id=${id}&current=${current}`)}>
            编辑
          </Button>,
          <Button
            type='primary'
            onClick={() => history.push(`/fixedTime/offlineManage?current=${current}`)}>
            返回
          </Button>,
        ]}>
        <Card className={styles.content}>
          <Descriptions title='回收点信息'>
            <DescriptionsItem
              label='回收点编号'>{data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.positionNo}</DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem
              label='回收点名称'>{data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.positionName}</DescriptionsItem>
            <DescriptionsItem
              label='联系电话'>{data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.contactTel}</DescriptionsItem>
            <DescriptionsItem
              label='地址'>{data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.address}</DescriptionsItem>
          </Descriptions>
          <Row>
            <Col>回收时段：</Col>
            <Col span={20}>
              {
                _.map(basicInfo && basicInfo.dsddOpeningHour, (item, k) => {
                  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                  const day = item.day.split(',');
                  const diff = _.difference(days, day);
                  const dayValue = _.difference(days, diff).join('，');
                  return (
                    <Row key={item.id}>
                      <Col sm={24} md={max < 4 ? max : max-1}>{dayValue}</Col>&emsp;
                      {item.timeStartAm && <Col>{`${item.timeStartAm}-${item.timeEndAm}`}&emsp;</Col>}
                      {item.timeStartPm && <Col>{`${item.timeStartPm}-${item.timeEndPm}`}</Col>}<br/>
                    </Row>
                  );
                })
              }
            </Col>
          </Row>
          <Divider/>
          <Descriptions title='回收类目及价格'>
            <DescriptionsItem label='回收类型'>
              <RadioGroup defaultValue={1} onChange={this.changeType} buttonStyle='solid'>
                <RadioButton value={1}>生活垃圾</RadioButton>&emsp;
                <RadioButton value={2}>废弃家电</RadioButton>
              </RadioGroup>
            </DescriptionsItem>
          </Descriptions>
          <Descriptions>
            <DescriptionsItem label='选择品类'>
              <RadioGroup value={currentCategory}
                          onChange={this.changeCategory} buttonStyle='solid'>
                {
                  _.map(typeData, item => {
                    return (
                      <RadioButton value={item.rootCategoryName}
                                   onChange={this.ejCategory}>{item.rootCategoryName}</RadioButton>
                    );
                  })
                }
              </RadioGroup>
            </DescriptionsItem>
          </Descriptions>
          <Row>
            <Col className={styles.recycleCategory}>回收价格：</Col>
            <Col span={15}>
              {
                category &&
                <Row className={styles.recycleCategory}>
                  <Col span={12} push={3}>二级品类名</Col>
                  {
                    value === 1 && <Col span={3}>价格</Col>
                  }
                </Row>
              }
              {
                _.map(category, i => {
                  return (
                    <Row style={{ marginTop: '10PX' }}>
                      <Col span={12} push={3}>{i.categoryName}</Col>
                      {
                        value === 1 && <Col span={3}>{i.price}</Col>
                      }
                      {
                        value === 1 && <Col span={2}>元/kg</Col>
                      }
                    </Row>
                  );
                })
              }
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Index;
