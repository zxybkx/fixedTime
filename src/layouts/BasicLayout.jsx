/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Link, useIntl, connect, history } from 'umi';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import md5 from 'md5';
import _ from 'lodash';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright="上海铸乾信息科技有限公司 "
    links={null}
  />
);

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (window.sessionStorage.getItem('token')) {
      const signdata = { isEvaluated: '0' };
      const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
      const signtimestamp = `${new Date().valueOf()}`;
      const token = window.sessionStorage.getItem('token');
      const signKey = window.sessionStorage.getItem('signKey');

      const params = {
        data: signdata,
        app_key: 'app_id_3',
        format: 'json',
        name: 'business.company.current',
        nonce: signnonce,
        timestamp: signtimestamp,
        version: '1.0',
        token: token,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${token}&version=1.0${signKey}`),
      };
      // console.log(111)
      dispatch({
        type: 'user/fetchCurrent',
        payload: params,
      });
    } else {
      history.push('/user');
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const { formatMessage } = useIntl();
  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        menuHeaderRender={(logoDom, titleDom) => (
          <Link to="/">
            {logoDom}
            {titleDom}
          </Link>
        )}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => {
          // 去掉第二级面包屑
          _.remove(routers, (item, idx) => idx === 0);
          return (
            [
              {
                path: '/',
                breadcrumbName: formatMessage({
                  id: 'menu.home',
                }),
              },
              ...routers,
            ]
          );
        }}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent/>}
        {...props}
        {...settings}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>
          {children}
        </Authorized>
      </ProLayout>
    </>
  );
};

export default connect(({ global, settings, login }) => ({
  collapsed: global.collapsed,
  settings,
  login,
}))(BasicLayout);
