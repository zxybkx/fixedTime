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
  message,
  Checkbox, InputNumber, Tooltip, Popconfirm,
} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import _ from 'lodash';
import { Map, Marker } from 'react-amap';
import { connect } from 'dva';
import md5 from 'md5';
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

  otherTime = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      recycleType: 'houseGarbage',
      initialTime: 5,
      initialParams: {
        app_key: 'app_id_1',
        name: 'recyclePosition.view',
        format: 'json',
        version: '1.0',
        token: this.getToken(),
      },
      data: {},
      lngLat: [],
      household: [],   // 生活垃圾
      abandoned: [],   // 废弃家电
      address: undefined,
      period: [],   // 记录添加的时段
      subhouseList: [],     //  生活垃圾的所有二级类目
      subabandonList: [],    // 废弃家电的所有二级类目
      finallHouseList: [],   // 生活垃圾配置的类目
      finallAbandonList: [],   // 废弃家电配置的类目
      timeCollection: null,
      next: true,    // 是否可以进行下一步
    };
  }

  getToken = () => {
    if (window.sessionStorage.getItem('token')) {
      return window.sessionStorage.getItem('token');
    }
    history.push('/user');
  };

  getSignKey = () => {
    if (window.sessionStorage.getItem('signKey')) {
      return window.sessionStorage.getItem('signKey');
    }
    history.push('/user');
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { dispatch, location: { query: { id } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
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
          const { dsddOpeningHour } = res.data && res.data.basicInfo;
          _.map(dsddOpeningHour, item => {
            _.map(timeColl, param => {
              if (item.day.indexOf(param.day) > -1) {
                if (item.timeStartAm) {
                  const amPeriod = {
                    0: moment(item.timeStartAm, 'HH:mm'),
                    1: moment(item.timeEndAm, 'HH:mm'),
                    mark: `day-${item.id}`,
                  };
                  param.am.push(amPeriod);
                }
                if (item.timeStartPm) {
                  const pmPeriod = {
                    0: moment(item.timeStartPm, 'HH:mm'),
                    1: moment(item.timeEndPm, 'HH:mm'),
                    mark: `day-${item.id}`,
                  };
                  param.pm.push(pmPeriod);
                }
              }
            });
          });

          this.setState({
            data: res.data,
            lngLat: [res.data.basicInfo && res.data.basicInfo.dsddRecyclePosition.lat, res.data.basicInfo && res.data.basicInfo.dsddRecyclePosition.lng],
            timeCollection: timeColl,
          });
        } else {
          message.error('数据获取失败，请重试！');
        }
      }
    });
  };

  nextStep = () => {
    const { step } = this.state;
    const current = step + 1;
    this.setState({
      step: current,
    });
  };

  lastStep = () => {
    const { step } = this.state;
    const current = step - 1;
    this.setState({
      step: current,
    });
    this.loadData();
  };

  periodChange = (value, name) => {
    const { timeCollection } = this.state;
    const values = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    if (_.indexOf(value, '全部') > -1) {
      this.formRef.current.setFieldsValue({ [name]: values });
    }

    const day = this.formRef.current.getFieldValue(`day-${name}`);
    const TimeCollection = _.cloneDeepWith(timeCollection);


    // _.map(TimeCollection, param => {
    //   _.map(param.am, item => {
    //     if(item.mark === name) {
    //
    //     }
    //   });
      // 删除工作日
      // 时间限制集合中标记与当前工作日name相同 且 该组时间限制的day中没有当前工作日，则删除该限制
      // _.remove(param.am, item => item.mark === name && _.indexOf(day, param.day) < 0);
      // _.remove(param.pm, item => item.mark === name && _.indexOf(day, param.day) < 0);

      // 增加工作日

    // });

    // console.log('TimeCollection', TimeCollection);
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
    const { dispatch, location: { query: { id } } } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    dispatch({
      type: 'fixedTime/getCategory',
      payload: {
        ...initialParams,
        name: 'recyclePosition.category.get',
        data: { id },
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

          // 生活垃圾配置的二级类目
          const finallHouseList = [];
          _.map(subhouseList, item => {
            if (item.price) {
              finallHouseList.push(item);
            }
          });

          // 废弃家电配置的二级类目
          const finallAbandonList = [];
          _.map(subabandonList, item => {
            if (item.price === 0) {
              finallAbandonList.push(item);
            }
            // item.price === 0 && finallAbandonList.push(item);
          });

          this.setState({
            household: res.data.household,
            abandoned: res.data.abandoned,
            subhouseList,
            subabandonList,
            finallHouseList,
            finallAbandonList,
          });
        } else {
          message.error('数据获取失败，请重试！');
        }
      }
    });
  };

  onRecycleInfoFinish = (values) => {
    const { dispatch, location: { query: { id } } } = this.props;
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
    const illegalTime = _.find(keyGroup, group => !times[group[1]] && !times[group[2]]);
    if (illegalTime) {
      return message.warning('一组时间段中上午和下午时间至少填一个');
    }
    if (!next) {
      return message.warning('每组时间段不可重复');
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
        id,
      };

      dispatch({
        type: 'fixedTime/createRecycle',
        payload: {
          ...initialParams,
          name: 'recyclePosition.edit',
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
          if (res.code === '0') {
            this.nextStep();
            this.loadCategory();
          } else {
            message.error('保存失败！');
          }
        }
      });
    }
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

  deletePeriod = (key) => {
    const { data, period, timeCollection } = this.state;
    const { dsddOpeningHour } = data.basicInfo && data.basicInfo;
    const Period = _.cloneDeepWith(period);
    const DsddOpeningHour = _.cloneDeepWith(dsddOpeningHour);
    const Data = _.cloneDeepWith(data);
    const day = this.formRef.current.getFieldValue(`day-${key}`);
    const TimeCollection = _.cloneDeepWith(timeCollection);

    _.map(day, item => {
      _.map(TimeCollection, param => {
        if (item === param.day) {
          const unUsedAmLimite = _.remove(param.pm, i => i.mark === `day-${key}`);
          const unUsedPmLimite = _.remove(param.am, i => i.mark === `day-${key}`);
          if (unUsedAmLimite || unUsedPmLimite) {
            this.setState({ next: true });
          }
        }
      });
    });

    const exitData = _.find(DsddOpeningHour, item => item.id === key);
    if (exitData) {
      _.remove(DsddOpeningHour, item => item.id === key);
      _.set(Data.basicInfo, 'dsddOpeningHour', DsddOpeningHour);
      this.setState({ data: Data });
    } else {
      this.setState({
        period: _.dropRight(Period),
      });
    }
    this.setState({
      timeCollection: TimeCollection,
    });
  };

  onCancel = () => {
    const { location: { query: { create, id, current } }, dispatch } = this.props;
    const { initialParams } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    if (create) {
      dispatch({
        type: 'fixedTime/recycleView',
        payload: {
          ...initialParams,
          name: 'recyclePosition.delete',
          data: { id },
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
      history.push(`/fixedTime/offlineManage?current=${current}`);
    }
  };

  renderRecycleInfoForm = () => {
    const { location: { query: { create } } } = this.props;
    const { data, address, period } = this.state;

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

    const position = data.basicInfo && data.basicInfo.dsddRecyclePosition;
    const initialLngLat = [position && position.lng, position && position.lat];

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

        // 逆地理编码
        AMap.plugin(['AMap.Geocoder'], () => {
          const geocoder = new AMap.Geocoder({
            // city: '',  //  默认全国
            radius: 1000,
          });

          geocoder.getAddress(initialLngLat, (status, result) => {
            if (status === 'complete' && result.regeocode) {
              const Address = result.regeocode.formattedAddress;
              this.setState({ address: Address });
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

    const lng = position && position.lng;
    const lat = position && position.lat;
    const markerPosition = { longitude: lng, latitude: lat };

    const time = data.basicInfo && data.basicInfo.dsddOpeningHour;
    const amRange = (time && time[0] && !_.isEmpty(time[0].timeStartAm) && [moment(time[0].timeStartAm, 'HH:mm'), moment(time[0].timeEndAm, 'HH:mm')]);
    const pmRange = (time && time[0] && !_.isEmpty(time[0].timeStartPm) && [moment(time[0].timeStartPm, 'HH:mm'), moment(time[0].timeEndPm, 'HH:mm')]);

    return (
      <Form {...layout} onFinish={this.onRecycleInfoFinish} ref={this.formRef} style={{ marginTop: '40px' }}
            key={time}>
        <FormItem
          label='回收点名称'
          name='positionName'
          initialValue={data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.positionName}
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
          initialValue={data.basicInfo && data.basicInfo.dsddRecyclePosition && data.basicInfo.dsddRecyclePosition.contactTel}
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
          name='address'>
          <div style={{ width: '100%', height: '300px' }}>
            <Map plugins={['ToolBar', 'Scale']}
                 events={amapEvents}
                 amapkey='432df346a4a3af71b894abda3069dc66'
                 center={markerPosition}>
              <Marker position={markerPosition} event={markerEvents}/>
            </Map>
            <Tooltip title={address}>
              <div className={styles.mapSearch}>
                <span>请输入关键字：</span>
                <input id="amapInput" defaultValue={address} autoComplete='off' disabled={!create && true}/>
              </div>
            </Tooltip>
          </div>
        </FormItem>
        <Row>
          <Col sm={24} md={12}>
            <FormItem label='回收时段'
                      name='day-0'
                      initialValue={time && time[0].day.split(',')}
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
                placeholder='请选择工作日' onChange={(value) => this.periodChange(value, 'day-0')}>
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
              {...amLayout}
              initialValue={amRange}
            >
              <RangePicker
                format={format}
                disabledHours={() => pm}
                hideDisabledOptions
                onChange={(times, timeStr) => this.amChange(times, timeStr, 0)}
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
              {...amLayout}
              initialValue={pmRange}
            >
              <RangePicker
                format={format}
                disabledHours={() => am}
                hideDisabledOptions
                onChange={(times, timeStr) => this.pmChange(times, timeStr, 0)}
                disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'pm')}/>
            </FormItem>
          </Col>
          <Col md={1}/>
        </Row>
        {
          _.map(time, (item, k) => {
            if (k !== 0) {
              const days = item.day.split(',');
              const otherAm = !_.isEmpty(item.timeStartAm) && [moment(item.timeStartAm, 'HH:mm'), moment(item.timeEndAm, 'HH:mm')];
              const otherPm = !_.isEmpty(item.timeStartPm) && [moment(item.timeStartPm, 'HH:mm'), moment(item.timeEndPm, 'HH:mm')];

              return (
                <div key={item.day}>
                  <Row>
                    <Col sm={24} md={12} push={8}>
                      <FormItem
                        name={`day-${item.id}`}
                        {...timeLayout}
                        initialValue={days}
                        rules={[
                          {
                            required: true,
                            message: '请选择回收时段',
                          },
                        ]}>
                        <Select
                          mode='multiple'
                          style={{ width: '100%' }}
                          placeholder='请选择工作日' onChange={(value) => this.periodChange(value, `day-${item.id}`)}>
                          {
                            datePeriod.map(param => {
                              return <Option key={param}>{param}</Option>;
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
                        initialValue={otherAm}
                      >
                        <RangePicker
                          format={format}
                          disabledHours={() => pm}
                          hideDisabledOptions
                          onChange={(times, timeStr) => this.amChange(times, timeStr, item.id)}
                          disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'am')}/>
                      </FormItem>
                    </Col>
                    <Col md={1} pull={2}>
                      <Popconfirm
                        title='确定删除该时间段吗？'
                        onConfirm={() => this.deletePeriod(item.id)}
                        okText='确定'
                        cancelText='取消'>
                        <CloseCircleOutlined style={{ float: 'right', cursor: 'pointer' }}/>
                      </Popconfirm>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}/>
                    <Col sm={24} md={11}>
                      <FormItem
                        key={otherPm}
                        label='下午'
                        name={`pm-${k}`}
                        {...amLayout}
                        initialValue={otherPm}
                      >
                        <RangePicker
                          format={format}
                          disabledHours={() => am}
                          hideDisabledOptions
                          onChange={(times, timeStr) => this.pmChange(times, timeStr, item.id)}
                          disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'pm')}/>
                      </FormItem>
                    </Col>
                    <Col md={1}/>
                  </Row>
                </div>
              );
            }
          })
        }
        {
          _.map(period, (item, k) => {
            return (
              <div key={k}>
                <Row>
                  <Col sm={24} md={12} push={8}>
                    <FormItem
                      name={`day-1-${k}`}
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
                        placeholder='请选择工作日' onChange={(value) => this.periodChange(value, `day-1-${k}`)}>
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
                      name={`ams-${k}`}
                      {...amLayout}
                      rule={[
                        { validator: (_, value, k) => this.validateTime(_, value, k) },
                      ]}>
                      <RangePicker
                        format={format}
                        disabledHours={() => pm}
                        hideDisabledOptions
                        onChange={(times, timeStr) => this.amChange(times, timeStr, `1-${k}`)}
                        disabledMinutes={(selectedHour) => this.minutesLimit(selectedHour, 'am')}/>
                    </FormItem>
                  </Col>
                  <Col md={1} pull={2}>
                    <Popconfirm
                      title='确定删除该时间段吗？'
                      onConfirm={() => this.deletePeriod(`1-${k}`)}
                      okText='确定'
                      cancelText='取消'>
                      <CloseCircleOutlined style={{ float: 'right', cursor: 'pointer' }}/>
                    </Popconfirm>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}/>
                  <Col sm={24} md={11}>
                    <FormItem
                      label='下午'
                      name={`pms-${k}`}
                      {...amLayout}>
                      <RangePicker
                        format={format}
                        disabledHours={() => am}
                        hideDisabledOptions
                        onChange={(times, timeStr) => this.pmChange(times, timeStr, `1-${k}`)}
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
        this.setState({
          recycleType: e.target.value,
        });
      }
    } else {
      _.map(finallAbandonList, item => _.set(item, 'price', 0));
      this.setState({
        recycleType: e.target.value,
      });
    }
  };

  // 选择类目
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

  // 配置类目
  configCategory = (values, type) => {
    const { dispatch, location: { query: { id } } } = this.props;
    const { initialParams, recycleType } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;

    let data;
    if (_.isEmpty(values)) {
      data = {
        positionId: id,
        deleteFlag: recycleType === 'houseGarbage' ? 'kg' : '台',
        list: [],
      };
    } else {
      data = {
        positionId: id,
        list: values,
      };
    }

    dispatch({
      type: 'fixedTime/categoryPrice',
      payload: {
        ...initialParams,
        name: 'recyclePosition.categoryAndPrice.config',
        data,
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

  // 类目配置下一步回调
  categoryNext = () => {
    const { finallHouseList, finallAbandonList, recycleType } = this.state;
    if (_.isEmpty(finallHouseList) && (_.isEmpty(finallAbandonList))) {
      return message.warning('请配置生活垃圾或废弃家电');
    }
    const unPrice = _.find(finallHouseList, item => !item.price);
    if (recycleType === 'houseGarbage') {
      if (unPrice) {
        return message.warning(`请输入${unPrice.categoryName}的回收价格`);
      }
    }

    _.map(finallAbandonList, item => _.set(item, 'price', 0));
    const values = _.concat(finallHouseList, finallAbandonList);
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
              <Checkbox defaultChecked={data && data.price}
                        onChange={(e) => this.chooseCategory(e, record)}>{text}</Checkbox>
            );
          }
          return (<span>{text}</span>);
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
              <InputNumber
                min={0} key={data} precision={2} defaultValue={data && data.price} onChange={(value) => {
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
        key: 'categoryName',
        render: (text, record) => {
          if (!record.children) {
            const data = _.find(finallAbandonList, item => item.categoryId === record.id);
            return (
              <Checkbox defaultChecked={data && true}
                        onChange={(e) => this.chooseCategory(e, record)}>{text}</Checkbox>
            );
          }
          return (<span>{text}</span>);
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

    const expandable = {
      defaultExpandAllRows: true,
      defaultExpandedRowKeys: _.map(Household, item => item.id),
    };

    return (
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
              // expandable={expandable}
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
        title='修改成功' subTitle={<span>5秒后返回列表页({initialTime})</span>}/>
    );
  };

  onBack = () => {
    const { location: { query: { create, id, current } }, dispatch } = this.props;
    const { initialParams, step } = this.state;
    const signtimestamp = `${new Date().valueOf()}`;
    const signdata = { isEvaluated: '0' };
    const signnonce = `bd1ded62-7fca-4585-b39f-42e4759c8b29${new Date().valueOf() + Math.random()}`;
    if (create && step !== 2) {
      dispatch({
        type: 'fixedTime/recycleView',
        payload: {
          ...initialParams,
          name: 'recyclePosition.delete',
          data: { id },
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
      history.push(`/fixedTime/offlineManage?current=${current}`);
    }
  };

  render() {
    const { location: { query: { create } } } = this.props;
    const { step } = this.state;

    return (
      <PageHeaderWrapper
        title={create ? '新建回收点' : '编辑回收点'}
        extra={[
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
