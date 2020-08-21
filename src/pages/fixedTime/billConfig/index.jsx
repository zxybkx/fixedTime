import React, { PureComponent } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Alert, Form, Checkbox, Tooltip, message, Col } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link, history } from 'umi';
import md5 from 'md5';
import { connect } from 'dva';
import _ from 'lodash';
import styles from './index.less';

const { Item: FormItem } = Form;

@connect(({ fixedTime }) => ({
  fixedTime,
}))
class BillConfig extends PureComponent {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      initialParams: {
        app_key: 'app_id_3',
        name: 'business.company.getPayTypes',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      point: undefined,    // 环保积分值
      money: undefined,     // 卖钱值
      recycleType: {},
    };
  }

  componentDidMount() {
    this.getJspzData();
  }

  getJspzData = () => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    dispatch({
      type: 'fixedTime/setJsfs',
      payload: {
        data: {},
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
        ...initialParams,
      },
    }).then(res => {
      if (res && res.code === '0') {
        this.setState({
          recycleType: res.data,
          point: (res.data.payTypes).indexOf('1') > -1 && true,
          money: (res.data.payTypes).indexOf('0') > -1 && true,
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

  configPoint = (e, type) => {
    const { dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/setJsfs',
      payload: {
        ...initialParams,
        name: 'business.company.SaveOrUpdatePayTypes',
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
        data: {
          flag: e.target.checked,
          payType: type,
        },
      },
    });
  };

  onChange = (e, type) => {
    const { point, money } = this.state;

    if (type === 0) {
      if (!point && !e.target.checked) {
        message.warning('环保积分和卖钱必须选一个');
      } else {
        this.setState({
          money: e.target.checked,
        });
        this.configPoint(e, type);
      }
    }

    if (type === 1) {
      if (!e.target.checked && !money) {
        message.warning('环保积分和卖钱必须选一个');
      } else {
        this.setState({
          point: e.target.checked,
        });
        this.configPoint(e, type);
      }
    }
  };

  render() {
    const { recycleType, point, money } = this.state;

    return (
      <PageHeaderWrapper>
        <Card className={styles.content}>
          <Alert message='环保积分和卖钱必须选一个' type='info' showIcon closable/>
          <Form ref={this.formRef}>
            <FormItem label='结算方式' className={styles.context} name='paytype'>
              <div className={styles.leftCon} key={recycleType.payTypes}>
                <Checkbox
                  onChange={(e) => this.onChange(e, 1)}
                  disabled={recycleType.status && recycleType.status === '0'}
                  checked={point}>
                  环保积分
                </Checkbox>
                <Tooltip title='该模式用户可获得服务商积分+平台积分'><QuestionCircleOutlined/></Tooltip>
                <Link to="/fixedTime/billConfig/recycleConfig">
                  <a className={styles.link}>配置积分</a>
                </Link>
              </div>
              <div key={!recycleType.payTypes}>
                <Checkbox
                  onChange={(e) => this.onChange(e, 0)}
                  checked={money}
                >卖钱</Checkbox>
                <Tooltip title='该模式用户可获得钱+平台积分'><QuestionCircleOutlined/></Tooltip>
              </div>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BillConfig;
