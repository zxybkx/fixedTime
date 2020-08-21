// import { AlipayCircleOutlined, TaobaoCircleOutlined, WeiboCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { PureComponent } from 'react';
// import { Link } from 'umi';
import { connect } from 'dva';
import styles from './style.less';
import LoginFrom from './components/Login';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginFrom;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: 'account',
    };
  }

  handleSubmit = (values) => {
    const { dispatch } = this.props;
    const { type } = this.state;

    console.log('values', values);

    if (values) {
      const data = {
        app_key: "app_id_3",
        format: "json",
        sign: "0E452B145998E0FB29CD5706C39745FA",
        version: "1.0",
        nonce: `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() +
        Math.random()}`,
        timestamp: `${new Date().valueOf()}`,
        name: "business.login",
        method: 'post',
        data: {
          ...values
        },
      };
      dispatch({
        type: 'login/login',
        payload: { ...data, type },
      });
    }
  };

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    const LoginMessage = ({ content }) => (
      <Alert
        style={{
          marginBottom: 24,
        }}
        message={content}
        type="error"
        showIcon
      />
    );

    return (
      <div className={styles.main}>
        <LoginFrom
          activeKey={type}
          ref={this.formRef}
          // onTabChange={setType}
          onSubmit={this.handleSubmit}>
          <Tab key="account" tab="企业端登录">
            {login.status === 'error' && login.type === 'account' && !submitting && (
              <LoginMessage content="账户或密码错误"/>
            )}

            <UserName
              name="userName"
              placeholder="请输入账号"
              rules={[
                {
                  required: true,
                  message: '请输入账号!',
                },
              ]}
            />
            <Password
              name="password"
              placeholder="请输入密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
              onPressEnter={() => this.formRef && this.formRef.handleSubmit()}
            />
          </Tab>
          {/*<Tab key="mobile" tab="手机号登录">*/}
          {/*  {status === 'error' && loginType === 'mobile' && !submitting && (*/}
          {/*    <LoginMessage content="验证码错误" />*/}
          {/*  )}*/}
          {/*  <Mobile*/}
          {/*    name="mobile"*/}
          {/*    placeholder="手机号"*/}
          {/*    rules={[*/}
          {/*      {*/}
          {/*        required: true,*/}
          {/*        message: '请输入手机号！',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        pattern: /^1\d{10}$/,*/}
          {/*        message: '手机号格式错误！',*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*  <Captcha*/}
          {/*    name="captcha"*/}
          {/*    placeholder="验证码"*/}
          {/*    countDown={120}*/}
          {/*    getCaptchaButtonText=""*/}
          {/*    getCaptchaSecondText="秒"*/}
          {/*    rules={[*/}
          {/*      {*/}
          {/*        required: true,*/}
          {/*        message: '请输入验证码！',*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*  />*/}
          {/*</Tab>*/}
          {/*<div>*/}
          {/*  <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>*/}
          {/*    自动登录*/}
          {/*  </Checkbox>*/}
          {/*  <a*/}
          {/*    style={{*/}
          {/*      float: 'right',*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    忘记密码*/}
          {/*  </a>*/}
          {/*</div>*/}
          <Submit loading={submitting}>登录</Submit>
          {/*<div className={styles.other}>*/}
          {/*  其他登录方式*/}
          {/*  <AlipayCircleOutlined className={styles.icon} />*/}
          {/*  <TaobaoCircleOutlined className={styles.icon} />*/}
          {/*  <WeiboCircleOutlined className={styles.icon} />*/}
          {/*  <Link className={styles.register} to="/user/register">*/}
          {/*    注册账户*/}
          {/*  </Link>*/}
          {/*</div>*/}
        </LoginFrom>
      </div>
    );
  }
}
;

export default Login;
