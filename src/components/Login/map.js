import React from 'react';
import { Icon } from 'antd';
import styles from './index.less';

export default {
  UserName: {
    props: {
      size: 'large',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: 'admin',
    },
    rules: [
      {
        required: true,
        message: 'Please enter username!',
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'password',
      placeholder: '888888',
    },
    rules: [
      {
        required: true,
        message: 'Please enter password!',
      },
    ],
  },
  Mobile: {
    props: {
      size: 'large',
      prefix: <Icon type="mobile" className={styles.prefixIcon} />,
    placeholder: '请输入手机号码',
    },
    rules: [
      {
        required: true,
        message: 'Please enter mobile numbe!',
      },
      {
        pattern: /^1\d{10}$/,
        message: '请输入手机号！',
      },
    ],
  },
  Captcha: {
    props: {
      size: 'large',
      prefix: <Icon type="mail" className={styles.prefixIcon} />,
      placeholder: '请输入手机验证码',
    },
    rules: [
      {
        required: true,
        message: '请输入手机验证码!',
      },
    ],
  },
};
