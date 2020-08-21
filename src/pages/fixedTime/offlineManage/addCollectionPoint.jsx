import React, { PureComponent, Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  Steps,
  Card,
  Button,
  Form,
  Input,
  TimePicker,
  Row,
  Col,
  Result,
  Radio,
  Table,
  Select,
  InputNumber,
  Checkbox,
  message,
  Popconfirm,
} from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { history } from 'umi';
import _ from 'lodash';
import { connect } from 'dva';
import md5 from 'md5';
import { Map, Marker } from 'react-amap';
import moment from 'moment';
import styles from './index.less';

const { Step } = Steps;
const { Item: FormItem } = Form;
const { RangePicker } = TimePicker;
const { Button: RadioButton, Group: RadioGroup } = Radio;
const { Option } = Select;

@connect(({ fixedTime, loading }) => ({
  fixedTime,
  loading: loading.effects['fixedTime/getCategory'],
}))
class AddCollectionPoint extends Component {
  formRef = React.createRef();

  category = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      recycleType: 'houseGarbage',
      initialTime: 5,
      initialParams: {
        app_key: 'app_id_1',
        name: 'recyclePosition.create',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      household: [],   // 生活垃圾
      abandoned: [],   // 废弃家电
      markerPosition: { longitude: 121.47, latitude: 31.23 },
      recycleId: null,   // 回收点信息创建成功后的ID
      lngLat: [],        //
      period: [],   // 记录添加的时段
      subhouseList: [],     //  生活垃圾的所有二级类目
      subabandonList: [],    // 废弃家电的所有二级类目
      finallHouseList: [],   // 生活垃圾最终选中的类目
      finallAbandonList: [],   // 废弃家电最终选中的类目
      timeCollection: null,
      next: true,    // 是否可以进行下一步
    };
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

  componentDidMount() {
    const timeColl = [
      {
        day: '周一',
        am: [],
        pm: [],
      },
      {
        day: '周二',
        am: [],
        pm: [],
      },
      {
        day: '周三',
        am: [],
        pm: [],
      },
      {
        day: '周四',
        am: [],
        pm: [],
      },
      {
        day: '周五',
        am: [],
        pm: [],
      },
      {
        day: '周六',
        am: [],
        pm: [],
      },
      {
        day: '周日',
        am: [],
        pm: [],
      },
    ];
    this.setState({ timeCollection: timeColl });
  }

  nextStep = () => {
    const { step } = this.state;
    const current = step + 1;
    this.setState({
      step: current,
    });
  };

  lastStep = () => {
    const { recycleId } = this.state;
    history.push(`/fixedTime/offlineManage/editCollectionPoint?id=${recycleId}&create=true`);
  };

  periodChange = (value, name) => {
    const values = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    if (_.indexOf(value, '全部') > -1) {
      this.formRef.current.setFieldsValue({ [name]: values });
    }
  };

  minutesLimit = (selectedHour, period) => {
    const minuteValues = [];
    for (let i = 1; i < 60; i++) {
      minuteValues.push(i);
    }

    if (selectedHour === 12) {
      if (period === 'am') {
        return minuteValues;
      } else {
        return [0];
      }
    }
  };

  addNewPeriod = () => {
    const { period } = this.state;
    const Period = _.cloneDeepWith(period);
    Period.push(1);
    this.setState({
      period: Period,
    });
  };

  loadCategory = () => {
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
      if (res) {
        if (res.code === '0') {
          // 生活垃圾二级所有二级类目
          const subhouseList = [];
          _.map(res.data.household, item => {
            _.map(item.subCategoryList, param => {
              const Param = _.cloneDeepWith(param);
              delete Param.id;
              const category = {
                ...Param,
                categoryId: param.id,
              };
              subhouseList.push(category);
            });
          });
          // 废弃家电二级所有二级类目
          const subabandonList = [];
          _.map(res.data.abandoned, item => {
            _.map(item.subCategoryList, param => {
              const Param = _.cloneDeepWith(param);
              delete Param.id;
              const category = {
                ...Param,
                categoryId: param.id,
              };
              subabandonList.push(category);
            });
          });
          this.setState({
            household: res.data.household,
            abandoned: res.data.abandoned,
            subhouseList,
            subabandonList,
            finallHouseList: subhouseList,
            finallAbandonList: subabandonList,
          });
        }
      }
    });
  };

  onRecycleInfoFinish = (values) => {
    const { dispatch } = this.props;
    const { initialParams, lngLat, next } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    const times = _.omit(values, ['positionName', 'contactTel', 'address']);
    const keys = [];
    _.forEach(times, (item, k) => {
      keys.push(k);
    });

    const keyGroup = _.chunk(keys, 3);
    const dsddOpeningHour = [];

    const illegalTime = _.find(keyGroup, group => (!times[group[1]] || _.isEmpty(times[group[1]])) && (!times[group[2]] || _.isEmpty(times[group[2]])));

    if (illegalTime) {
      return message.warning('一组时间段中上午和下午时间至少填一个');
    }
    if (!next) {
      return message.warning('每组时间段不可重复');
    } else {
      _.map(keyGroup, group => {
        const time = {};
        _.set(time, 'day', _.join(times[group[0]], ','));
        _.set(time, 'timeStartAm', times[group[1]] && times[group[1]][0] && times[group[1]][0].format('HH:mm') || '');
        _.set(time, 'timeEndAm', times[group[1]] && times[group[1]][1] && times[group[1]][1].format('HH:mm') || '');
        _.set(time, 'timeStartPm', times[group[2]] && times[group[2]][0] && times[group[2]][0].format('HH:mm') || '');
        _.set(time, 'timeEndPm', times[group[2]] && times[group[2]][1] && times[group[2]][1].format('HH:mm') || '');
        _.set(time, 'version', 1);
        _.set(time, 'new', true);
        dsddOpeningHour.push(time);
      });

      const dsddRecyclePosition = {
        contactTel: values.contactTel,
        lng: lngLat[1],
        lat: lngLat[0],
        positionName: values.positionName,
        version: 1,
        new: true,
      };

      dispatch({
        type: 'fixedTime/createRecycle',
        payload: {
          ...initialParams,
          data: {
            dsddRecyclePosition,
            dsddOpeningHour,
          },
          nonce: signnonce,
          timestamp: signtimestamp,
          sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
        },
      }).then(res => {
        if (res) {
          if (res.code === '0' && res.data.recyclePositionId) {
            this.nextStep();
            this.loadCategory();
            this.setState({
              recycleId: res.data.recyclePositionId,
            });
          } else {
            message.error(res.data.msg || '保存失败！');
          }
        }
      });
    }
  };

  validateTime = (_, value, k) => {
    const pm = this.formRef.current.getFieldValue(`pm-${k}`);
    if (!value && !pm) {
      return Promise.reject('一组时间段上午和下午时间至少填一个');
    } else {
      Promise.resolve();
    }
  };

  onCancel = () => {
    history.push('/fixedTime/offlineManage');
  };

  amChange = (time, timeString, name) => {
    const { timeCollection } = this.state;
    const day = this.formRef.current.getFieldValue(`day-${name}`);
    const TimeCollection = _.cloneDeepWith(timeCollection);

    if (time) {
      _.map(day, item => {
        _.map(TimeCollection, param => {
          if (item === param.day) {
            // 判断是否是第一次
            if (!_.isEmpty(param.am)) {
              // 修改时去除当前的时间段
              _.remove(param.am, i => i.mark === `day-${name}`);

              _.map(param.am, per => {
                if (moment(time[0].format()).isSameOrAfter(moment(per[1].format())) || moment(time[1].format()).isSameOrBefore(moment(per[0].format()))) {
                  const period = {
                    ...time,
                    mark: `day-${name}`,
                  };
                  param.am.push(period);
                  this.setState({ next: true });
                } else {
                  message.warning('每组时间段不可重复！');
                  this.setState({ next: false });
                }
              });
            } else {
              const period = {
                ...time,
                mark: `day-${name}`,
              };
              param.am.push(period);
            }
          }
        });
      });
    }
    this.setState({ timeCollection: TimeCollection });
  };

  pmChange = (time, timeString, name) => {
    const { timeCollection } = this.state;
    const day = this.formRef.current.getFieldValue(`day-${name}`);
    const TimeCollection = _.cloneDeepWith(timeCollection);

    if (time) {
      _.map(day, item => {
        _.map(TimeCollection, param => {
          if (item === param.day) {
            // 判断是否是第一次
            if (!_.isEmpty(param.pm)) {
              // 修改时去除当前的时间段
              _.remove(param.pm, i => i.mark === `day-${name}`);
              _.map(param.pm, per => {
                if (moment(time[0].format()).isSameOrAfter(moment(per[1].format())) || moment(time[1].format()).isSameOrBefore(moment(per[0].format()))) {
                  const period = {
                    ...time,
                    mark: `day-${name}`,
                  };
                  param.pm.push(period);
                  this.setState({ next: true });
                } else {
                  message.warning('每组时间段不可重复！');
                  this.setState({ next: false });
                }
              });
            } else {
              const period = {
                ...time,
                mark: `day-${name}`,
              };
              param.pm.push(period);
            }
          }
        });
      });
    }
    this.setState({ timeCollection: TimeCollection });
  };

  // 删除时间段回调
  deletePeriod = (key) => {
    const { timeCollection, period } = this.state;
    const day = this.formRef.current.getFieldValue(`day-${key}`);
    const TimeCollection = _.cloneDeepWith(timeCollection);
    const Period = _.cloneDeepWith(period);

    _.map(day, item => {
      _.map(TimeCollection, param => {
        if (item === param.day) {
          const unUsedAmLimite = _.remove(param.pm, i => i.mark === `day-${key}`);
          const unUsedPmLimite = _.remove(param.am, i => i.mark === `day-${key}`);
          if(unUsedAmLimite || unUsedPmLimite) {
            this.setState({next: true})
          }
        }
      });
    });

    this.formRef.current.setFieldsValue({
      [`day-${key}`]: [],
      [`am-${key}`]: [],
      [`pm-${key}`]: [],
    });

    this.setState({
      timeCollection: TimeCollection,
      period: _.dropRight(Period),
    });
  };

  renderRecycleInfoForm = () => {
    const { markerPosition, period } = this.state;
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };
    const timeLayout = {
      labelCol: { span: 16 },
      wrapperCol: { span: 8 },
    };
    const amLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const datePeriod = ['全部', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const format = 'HH:mm';
    const am = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const pm = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    const amapEvents = {
      created: mapInstance => {
        // console.log('高德地图 Map 实例创建成功；如果你要亲自对实例进行操作，可以从这里开始。比如：');
        // console.log('缩放级别：', mapInstance.getZoom());
        this.mapInstance = mapInstance;

        AMap.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.CitySearch'], () => {
          // 实例化Autocomplete
          const autoOptions = {
            // city: '',   // 默认全国
            input: 'amapInput',   // 绑定输入提示功能的input的DOM ID
          };

          // 无需手动执行search方法，autoComplete会根据传入的input对应的DOM动态触发search
          const autoComplete = new AMap.Autocomplete(autoOptions);
          const placeSearch = new AMap.PlaceSearch({
            // city: '南京',
            map: mapInstance,
          });

          // 监听下拉框选中事件
          AMap.event.addListener(autoComplete, 'select', e => {
            placeSearch.setCity(e.poi.adcode);
            placeSearch.search(e.poi.name);
            const lngLat = [e.poi.location.lat, e.poi.location.lng];
            this.setState({ lngLat });
            // console.log('下拉框选择位置', lngLat);
          });

          const citySearch = new AMap.CitySearch();
          citySearch.getLocalCity((status, result) => {
            // console.log('status', status);
            // console.log('result', result);
            if (status === 'complete' && result.info === 'OK') {
              // 查询成功，result即为当前所在城市信息
              // console.log('city', result);
              if (result && result.city && result.bounds) {
                // 当前城市名称
                // const cityinfo = result.city;
                // 当前城市位置信息
                const citybounds = result.bounds;
                // 地图显示当前城市
                mapInstance.setBounds(citybounds);
              }
            }
          });
        });
        // 实例点击事件
        mapInstance.on('click', e => {
          const lngLat = `${e.lnglat.getLat()},${e.lnglat.getLng()}`;
          // console.log('地图点击位置', e);
          // this.props.onChange(lngLat);
        });
      },
    };
    const markerEvents = {
      created: markerInstance => {
        // console.log('高德地图 Marker 实例创建成功；如果你要亲自对实例进行操作，可以从这里开始。比如：');
        // console.log(markerInstance.getPosition());
        this.markerInstance = markerInstance;
      },
    };

    return (
      <Form {...layout} style={{ marginTop: '40px' }} ref={this.formRef} onFinish={this.onRecycleInfoFinish}>
        <FormItem
          label='回收点名称'
          name='positionName'
          rules={[
            {
              required: true,
              message: '请输入回收点名称',
            },
            {
              validator: (_, value) => {
                return value.length > 20 ? Promise.reject('回收点名称限制输入20个字') : Promise.resolve();
              },
            },
          ]}>
          <Input style={{ width: '50%' }}/>
        </FormItem>
        <FormItem
          label='联系电话'
          name='contactTel'
          rules={[
            {
              required: true,
              message: '请输入联系电话',
            },
            {
              validator: (_, value) => {
                const regExp = /^1\d{10}$/;
                return regExp.test(value) ? Promise.resolve() : Promise.reject('请输入正确的手机号码');
              },
            },
          ]}>
          <Input placeholder='该号码将显示在用户端' style={{ width: '50%' }}/>
        </FormItem>
        <FormItem
          label='回收点地址'
          name='address'
          rules={[
            {
              required: true,
              message: '请选择回收点地址',
            },
          ]}>
          <div style={{ width: '100%', height: '300px' }}>
            <Map plugins={['ToolBar']}
                 events={amapEvents}
                 amapkey='432df346a4a3af71b894abda3069dc66'
                 center={markerPosition}>
              <Marker position={markerPosition} event={markerEvents}/>
            </Map>
            <div className={styles.mapSearch}>
              <span>请输入关键字：</span>
              <input id="amapInput" autoComplete='off'/>
            </div>
          </div>
        </FormItem>
        <Row>
          <Col sm={24} md={12}>
            <FormItem label='回收时段'
                      name='day-n'
                      {...timeLayout}
                      rules={[
                        {
                          required: true,
                          message: '请选择回收时段',
                        },
                      ]}>
              <Select
                mode='multiple'
                style={{ width: '100%' }}
                placeholder='请选择工作日' onChange={(value) => this.periodChange(value, 'day-n')}>
                {
                  datePeriod.map(item => {
                    return <Option key={item}>{item}</Option>;
                  })
                }
              </Select>
            </FormItem>
          </Col>
          <Col sm={24} md={11}>
            <FormItem
              label='上午'
              name='am'
              {...amLayout}>
              <RangePicker
                format={format}
                disabledHours={() => pm}
                hideDisabledOptions
                onChange={(time, timeStr) => this.amChange(time, timeStr, 'n')}
                disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'am')}/>
            </FormItem>
          </Col>
          <Col md={1}/>
        </Row>
        <Row>
          <Col md={12}/>
          <Col sm={24} md={11}>
            <FormItem
              label='下午'
              name='pm'
              {...amLayout}>
              <RangePicker
                format={format}
                disabledHours={() => am}
                hideDisabledOptions
                onChange={(time, timeStr) => this.pmChange(time, timeStr, 'n')}
                disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'pm')}/>
            </FormItem>
          </Col>
          <Col md={1}/>
        </Row>
        {
          _.map(period, (item, k) => {
            return (
              <div key={k}>
                <Row>
                  <Col sm={24} md={12} push={8}>
                    <FormItem
                      name={`day-${k}`}
                      {...timeLayout}
                      initialValue={[]}
                      rules={[
                        {
                          required: true,
                          message: '请选择回收时段',
                        },
                      ]}>
                      <Select
                        mode='multiple'
                        style={{ width: '100%' }}
                        placeholder='请选择工作日' onChange={(value) => this.periodChange(value, `day-${k}`)}>
                        {
                          datePeriod.map(item => {
                            return <Option key={item}>{item}</Option>;
                          })
                        }
                      </Select>
                    </FormItem>
                  </Col>
                  <Col sm={24} md={11}>
                    <FormItem
                      label='上午'
                      name={`am-${k}`}
                      {...amLayout}
                      initialValue={[]}
                      rule={[
                        { validator: (_, value, k) => this.validateTime(_, value, k) },
                      ]}>
                      <RangePicker
                        format={format}
                        disabledHours={() => pm}
                        hideDisabledOptions
                        onChange={(time, timeStr) => this.amChange(time, timeStr, k)}
                        disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'am')}/>
                    </FormItem>
                  </Col>
                  <Col md={1} pull={2}>
                    <Popconfirm
                      title='确定删除该时间段吗？'
                      onConfirm={() => this.deletePeriod(k)}
                      okText='确定'
                      cancelText='取消'>
                      <CloseCircleOutlined style={{ float: 'right', cursor: 'pointer' }}/>
                    </Popconfirm>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}/>
                  <Col sm={24} md={11}>
                    <FormItem label='下午' name={`pm-${k}`} {...amLayout}>
                      <RangePicker
                        format={format}
                        disabledHours={() => am}
                        hideDisabledOptions
                        initialValue={[]}
                        onChange={(time, timeStr) => this.pmChange(time, timeStr, k)}
                        disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'pm')}/>
                    </FormItem>
                  </Col>
                  <Col md={1}/>
                </Row>
              </div>
            );
          })
        }
        <FormItem {...tailLayout}>
          <Button type='dashed' icon={<PlusOutlined/>} onClick={this.addNewPeriod}>添加新时段</Button>
        </FormItem>
        <FormItem {...tailLayout}>
          <Button type='primary' htmlType='submit'>下一步</Button>&emsp;
          <Button onClick={this.onCancel}>取消</Button>
        </FormItem>
      </Form>
    );
  };

  recycleTypeChange = (e) => {
    const { recycleType, finallHouseList, finallAbandonList } = this.state;

    if (recycleType === 'houseGarbage') {
      const unPrice = _.find(finallHouseList, item => !item.price);
      if (unPrice) {
        message.warning(`请输入${unPrice.categoryName}的回收价格`);
      } else {
        // this.setCategoryPrice(finallHouseList, e.target.value);
        this.setState({
          recycleType: e.target.value,
        });
      }
    } else {
      _.map(finallAbandonList, item => _.set(item, 'price', 0));
      // this.setCategoryPrice(finallAbandonList, e.target.value);
      this.setState({
        recycleType: e.target.value,
      });
    }
  };

  // 操作复选框，得到取消选中的类目id
  chooseCategory = (e, record) => {
    const { recycleType, subhouseList, subabandonList, finallHouseList, finallAbandonList } = this.state;
    const SubhouseList = _.cloneDeepWith(subhouseList);
    const FinallHouseList = _.cloneDeepWith(finallHouseList);
    const SubabandonList = _.cloneDeepWith(subabandonList);
    const FinallAbandonList = _.cloneDeepWith(finallAbandonList);

    if (recycleType === 'houseGarbage') {
      // 排除取消选中的类目
      if (e.target.checked) {
        // 生活垃圾加入选中的类目
        const param = _.find(SubhouseList, item => item.categoryId === record.id);
        const exitData = _.find(FinallHouseList, item => item.categoryId === record.id);
        !exitData && FinallHouseList.push(param);
        this.setState({ finallHouseList: FinallHouseList });
      } else {
        // 生活垃圾去除取消选中的类目
        _.remove(FinallHouseList, item => item.categoryId === record.id);
        this.setState({ finallHouseList: FinallHouseList });
      }
    } else {
      // 排除取消选中的类目
      if (e.target.checked) {
        // 废弃家电加入选中的类目
        const param = _.find(SubabandonList, item => item.categoryId === record.id);
        FinallAbandonList.push(param);
        this.setState({ finallAbandonList: FinallAbandonList });
      } else {
        // 废弃家电去除取消选中的类目
        _.remove(FinallAbandonList, item => item.categoryId === record.id);
        this.setState({ finallAbandonList: FinallAbandonList });
      }
    }
  };

  // 配置类目
  configCategory = (values, type) => {
    const { dispatch } = this.props;
    const { initialParams, recycleId } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/categoryPrice',
      payload: {
        ...initialParams,
        name: 'recyclePosition.categoryAndPrice.config',
        data: {
          positionId: recycleId,
          list: values,
        },
        nonce: signnonce,
        timestamp: signtimestamp,
        sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
      },
    }).then(res => {
      if (res) {
        if (res.code === '0') {
          if (type) {
            this.setState({
              recycleType: type,
            });
          } else {
            this.nextStep();
          }
        } else {
          message.error('保存失败！');
        }
      }
    });
  };

  setPrice = (value, id) => {
    const { finallHouseList, subhouseList } = this.state;
    const SubhouseList = _.cloneDeepWith(subhouseList);
    const FinallHouseList = _.cloneDeepWith(finallHouseList);
    const param = _.find(SubhouseList, item => item.categoryId === id);
    const exitData = _.find(FinallHouseList, item => item.categoryId === id);
    !exitData && FinallHouseList.push(param);

    _.map(FinallHouseList, item => {
      if (item.categoryId === id) {
        _.set(item, 'price', value);
      }
    });
    this.setState({
      finallHouseList: FinallHouseList,
    });
  };

  // 类目配置下一步回调
  categoryNext = () => {
    const { finallHouseList, finallAbandonList, recycleType } = this.state;
    if (_.isEmpty(finallHouseList) && (_.isEmpty(finallAbandonList))) {
      message.warning('请配置生活垃圾或废弃家电');
    }
    const unPrice = _.find(finallHouseList, item => !item.price);
    if (recycleType === 'houseGarbage') {
      if (unPrice) {
        return message.warning(`请输入${unPrice.categoryName}的回收价格`);
      }
    }
    // 整合数据
    _.map(finallAbandonList, item => _.set(item, 'price', 0));
    const values = _.concat(finallHouseList ,finallAbandonList);
    this.configCategory(values);
  };

  renderRecycleGategoryForm = () => {
    const { loading } = this.props;
    const { recycleType, abandoned, household, finallHouseList, finallAbandonList } = this.state;
    const houseColumns = [
      {
        title: '品类名称',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text, record) => {
          if (!record.children) {
            const data = _.find(finallHouseList, item => item.categoryId === record.id);
            return (
              <Checkbox
                defaultChecked={data && true}
                onChange={(e) => this.chooseCategory(e, record)}>{text}</Checkbox>
            );
          } else {
            return (<span>{text}</span>);
          }
        },
      },
      {
        title: '回收价格（元/kg）',
        dataIndex: 'price',
        key: 'price',
        render: (text, record) => {
          if (!record.children) {
            const data = _.find(finallHouseList, item => item.categoryId === record.id);
            return (
              <InputNumber key={data} min={0} precision={2} defaultValue={data && data.price} onChange={(value) => {
                this.setPrice(value, record.id);
              }}/>
            );
          }
        },
      },
    ];
    const abandonColumns = [
      {
        title: '品类名称',
        dataIndex: 'categoryName',
        render: (text, record) => {
          if (!record.children) {
            const data = _.find(finallAbandonList, item => item.categoryId === record.id);
            return (
              <Checkbox defaultChecked={data && true} onChange={(e) => this.chooseCategory(e, record)}>{text}</Checkbox>
            );
          } else {
            return (<span>{text}</span>);
          }
        },
      },
    ];

    const Household = [];
    _.map(household, item => {
      const Item = {};
      _.set(Item, 'categoryName', item.rootCategoryName);
      _.set(Item, 'key', item.rootCategoryName);
      _.set(Item, 'children', item.subCategoryList);
      Household.push(Item);
    });


    const Abandoned = [];
    _.map(abandoned, item => {
      const Item = {};
      _.set(Item, 'categoryName', item.rootCategoryName);
      _.set(Item, 'key', item.rootCategoryName);
      _.set(Item, 'children', item.subCategoryList);
      Abandoned.push(Item);
    });

    return (
      <div>
        <div style={{ margin: '40px 0 20px 0' }}>
          回收类型：
          <RadioGroup value={recycleType} buttonStyle='solid' onChange={this.recycleTypeChange}>
            <RadioButton value='houseGarbage'>生活垃圾</RadioButton>&emsp;
            <RadioButton value='abandonHomeAppliances'>废弃家电</RadioButton>
          </RadioGroup>
          {
            recycleType === 'houseGarbage' ?
              <Table
                columns={houseColumns}
                dataSource={Household}
                style={{ marginTop: '20px' }}
                pagination={false}
                loading={loading}/> :
              <Table
                columns={abandonColumns}
                dataSource={Abandoned}
                style={{ marginTop: '20px' }}
                pagination={false}
                loading={loading}/>
          }
          <div className={styles.bottomBtn}>
            <Button
              onClick={this.categoryNext}>
              下一步
            </Button>&emsp;
            <Button onClick={this.lastStep}>上一步</Button>
          </div>
        </div>
      </div>
    );
  };

  renderComplete = () => {
    const { initialTime } = this.state;
    if (initialTime > 0) {
      setTimeout(() => {
        this.setState({
          initialTime: initialTime - 1,
        });
      }, 1000);
    } else {
      history.push('/fixedTime/offlineManage');
    }

    return (
      <Result
        status='success'
        title='创建成功' subTitle={<span>5秒后返回列表页({initialTime})</span>}/>
    );
  };

  onBack = () => {
    const { dispatch } = this.props;
    const { initialParams, step, recycleId } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    if (step === 1) {
      dispatch({
        type: 'fixedTime/recycleView',
        payload: {
          ...initialParams,
          name: 'recyclePosition.delete',
          data: { id: recycleId },
          nonce: signnonce,
          timestamp: signtimestamp,
          sign: md5(`app_key=app_id_3&data=${JSON.stringify(signdata)}&format=json&name=business.company.current&nonce=${signnonce}&timestamp=${signtimestamp}&token=${this.getToken()}&version=1.0${this.getSignKey()}`),
        },
      }).then(res => {
        if (res && res.code === '0') {
          history.push(`/fixedTime/offlineManage`);
        }
      });
    } else {
      history.push(`/fixedTime/offlineManage`);
    }
  };

  render() {
    const { step } = this.state;

    return (
      <PageHeaderWrapper extra={[
        <Button
          type='primary'
          onClick={this.onBack}>
          返回
        </Button>,
      ]}>
        <Card>
          <div className={styles.default}>
            <Steps current={step}>
              <Step title='填写回收点信息'/>
              <Step title='配置回收类目'/>
              <Step title='完成'/>
            </Steps>
            {step === 0 ? this.renderRecycleInfoForm() : step === 1 ? this.renderRecycleGategoryForm() : this.renderComplete()}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AddCollectionPoint;
