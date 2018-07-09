import React, { Component } from 'react';
import pureRender from 'pureRender-mj';
import _ from 'lodash';
import { Button, Input } from 'mjui';
import moment from 'moment';
import { Icon, Options, MJRangePicker } from '../../../components/Widgets';
import './index.scss';


@pureRender()
class GTLFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showArrow: false,
      showItem: false,
    };
  }

  componentDidMount() {
    this.showArrow();
  }

  componentDidUpdate() {
    this.showArrow();
  }

  // 接受option筛选项数据
  getFilterOptions = () => {
    const { gtlState } = this.props;
    const filter = gtlState.get('filter') ? gtlState.get('filter').toJS() : [];
    const { deptCity = [], deptTime = [], tag = [] } = filter;
    const deptCityArr = deptCity.map((item) => { return { key: item.name, value: item }; });
    const deptTimeArr = deptTime.map((item) => {
      return { key: item.show, value: { type: item.type, time: item.time } };
    });
    const tagArr = tag.map((item) => { return { key: item.name, value: item.id }; });

    // const priceArr = [
    //   { key: '400以下', value: '-400' },
    //   { key: '400-700', value: '400-700' },
    //   { key: '700-1000', value: '700-1000' },
    // ];

    return [
      {
        leftStr: '价位(CNY)',
        radio: [{ key: '不限', value: [] }],
        option: 'price',
        value: [0],
      },
      {
        leftStr: '成团地点',
        radio: [{ key: '不限', value: [] }],
        option: 'deptCity',
        checkbox: deptCityArr,
        value: [1],
      },
      {
        leftStr: '特色标签',
        radio: [{ key: '不限', value: [] }],
        option: 'tag',
        checkbox: tagArr,
        value: [2],
      },
      {
        leftStr: '出发时间',
        radio: [{ key: '不限', value: [] }],
        option: 'deptTime',
        checkbox: deptTimeArr,
        value: [3],
      },
    ];
  }

  getRef = (option, ref) => {
    if (option === 'deptCity') {
      this.wrap = ref;
    }
  };

  // version 1：当高度大于30px时展示箭头  by 左钊
  // version 2：scrollHeight > clientHeight 时展示箭头 by mysterious coder
  showArrow = () => {
    if (!this.wrap) return;
    const { clientHeight, scrollHeight } = this.wrap;
    const { showItem } = this.state;
    const showArrow = (scrollHeight > clientHeight) || showItem;
    this.setState({ showArrow });
  }

  // 点击确定将自定义价格区间搞到query里并打请求
  handleClick = () => {
    const { gtlState, modifyGTListQuery, changeReducerVal } = this.props;
    let min = _.get(gtlState.toJS(), ['customPrice', 'from'], 0);
    let max = _.get(gtlState.toJS(), ['customPrice', 'to'], 0);
    if (!min || !max) {
      if (!min && !max) {
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'fromErr'],
          value: true,
          action: 2,
        });
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'toErr'],
          value: true,
          action: 2,
        });
      } else if (!max) {
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'toErr'],
          value: true,
          action: 2,
        });
      } else {
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'fromErr'],
          value: true,
          action: 2,
        });
      }
      return;
    }

    // 输入000点确定变为0，012变为12
    if (min !== '' && max !== '') {
      min = parseFloat(min);
      max = parseFloat(max);
      min = min.toString();
      max = max.toString();
    }
    changeReducerVal('gtStoreList', {
      path: ['customPrice', 'from'],
      value: min,
      action: 2,
    });
    changeReducerVal('gtStoreList', {
      path: ['customPrice', 'to'],
      value: max,
      action: 2,
    });

    if (min && max && ((min - max) > 0)) {
      changeReducerVal('gtStoreList', {
        path: ['customPrice', 'fromErr'],
        value: true,
        action: 2,
      });
      changeReducerVal('gtStoreList', {
        path: ['customPrice', 'toErr'],
        value: true,
        action: 2,
      });
      return;
    }

    min = parseFloat(min);
    max = parseFloat(max);
    const price = {
      min,
      max,
    };

    modifyGTListQuery(price, ['filter', 'price']);
  }

  handleChange = (option, value) => {
    const { modifyGTListQuery, changeReducerVal } = this.props;

    // 当option不为fromto以及option为fromto所做的操作
    if (option !== 'from' && option !== 'to') {
      modifyGTListQuery(value, ['filter', option]);
      // 当选中不限时，清空自定义价位框
      if (option === 'price') {
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'from'],
          value: '',
          action: 2,
        });
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'to'],
          value: '',
          action: 2,
        });
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'fromErr'],
          value: false,
          action: 2,
        });
        changeReducerVal('gtStoreList', {
          path: ['customPrice', 'toErr'],
          value: false,
          action: 2,
        });
      }
      // 当选中不限时，清空自定义时间选择器
      if (option === 'deptTime') {
        if (value.length === 0) {
          changeReducerVal('gtStoreList', {
            path: ['customTime'],
            value: null,
            action: 2,
          });
        }
      }
    } else {
      changeReducerVal('gtStoreList', {
        path: ['customPrice', option],
        value,
        action: 2,
      });
      changeReducerVal('gtStoreList', {
        path: ['customPrice', 'fromErr'],
        value: false,
        action: 2,
      });
      changeReducerVal('gtStoreList', {
        path: ['customPrice', 'toErr'],
        value: false,
        action: 2,
      });
    }
  }

  dataPicker = (option, date, dateString) => {
    const newDateString = dateString[0] && dateString[1] ? dateString[0].replace(/-/g, '').concat('-') + dateString[1].replace(/-/g, '') : '';
    const { modifyGTListQuery, changeReducerVal, gtlState } = this.props;
    const oldData = gtlState.getIn(['query', 'filter', 'deptTime']).toJS().filter(item => item.type !== 2);
    const newData = newDateString ? [{
      type: 2,
      time: newDateString,
    }] : [];
    const data = [...oldData, ...newData];
    modifyGTListQuery(data, ['filter', 'deptTime']);
    changeReducerVal('gtStoreList', {
      path: ['customTime'],
      value: date,
      action: 2,
    });
  }
  disabledDate = (current) => {
    // Can not select days before today - 1
    return current && current < moment().subtract(1, 'days');
  }

  handleInputChange = (opt, value) => {
    if (value !== '') {
      value = String(Number(value)); // 限制 多0输入
    }
    this.handleChange(opt, value);
  }

  renderSpec = (option) => {
    const { gtlState } = this.props;
    const from = _.get(gtlState.toJS(), ['customPrice', 'from'], '');
    const to = _.get(gtlState.toJS(), ['customPrice', 'to'], '');
    const fromErr = _.get(gtlState.toJS(), ['customPrice', 'fromErr'], false);
    const toErr = _.get(gtlState.toJS(), ['customPrice', 'toErr'], false);
    const time = _.get(gtlState.toJS(), ['customTime'], null);

    if (option === 'price') {
      return (
        <div className="price">
          <Input
            option="from"
            error={fromErr}
            value={from || ''}
            placeholder="自定义"
            className="price-in"
            width={56}
            type="number"
            size="small"
            maxLength={8}
            onChange={this.handleInputChange}
          />
          &nbsp;-&nbsp;
          <Input
            option="to"
            error={toErr}
            value={to || ''}
            placeholder="自定义"
            className="price-in"
            width={56}
            type="number"
            maxLength={8}
            size="small"
            onChange={this.handleInputChange}
          />
          {/* <Input
            option="name"
            placeholder="请输入产品名称"
            width={840}
            value={name}
            onChange={this.handleInputChange}
            error={this.state.nameNeedError}
          /> */}
          <Button
            type="default"
            width={50}
            height={20}
            onClick={this.handleClick}
          >
            确定
          </Button>
        </div>
      );
    }
    if (option === 'deptTime') {
      return (
        <MJRangePicker
          placeholder="自定义"
          className="date"
          option="date"
          onChange={this.dataPicker}
          value={time}
          disabledDate={this.disabledDate}
        />
      );
    }
    if (option === 'deptCity' && this.state.showArrow) {
      return (
        <Icon
          type="dropmenu"
          className={`address-tog ${this.state.showItem ? 'rotate' : ''}`}
          onClick={() => { this.setState({ showItem: !this.state.showItem }); }}
        />
      );
    }
  }

  renderOptions = () => {
    const filterOptions = this.getFilterOptions();
    const { gtlState } = this.props;
    const filterState = _.get(gtlState.toJS(), ['query', 'filter'], {});

    return (
      filterOptions.map((filter) => {
        const value = filterState[filter.option] || [];
        return (
          <div key={filter.value[0]} className="filter-item">
            <div className="filter-left">{filter.leftStr}</div>
            <div className="filter-right-wrap" >
              <div className="filter-single">
                <Options
                  radio={filter.radio}
                  option={filter.option}
                  value={value}
                  radioChange={this.handleChange}
                  className="single"
                />
              </div>
              <div className="filter-right">
                <div className={`option-item ${filter.option === 'deptCity' && !this.state.showItem/*  && this.state.showArrow */ ? 'address-spec' : ''}`} ref={(ref) => { this.getRef(filter.option, ref); }}>
                  {
                    filter.option !== 'price' ?
                      (
                        <Options
                          checkbox={filter.checkbox}
                          option={filter.option}
                          value={value}
                          checkChange={this.handleChange}
                          className="filter"
                          checkIconNew
                        />
                      ) : null
                  }
                </div>
                {
                  this.renderSpec(filter.option)
                }
              </div>
            </div>
          </div>
        );
      })
    );
  }

  render() {
    return (
      <div className="gtl-filter">
        {this.renderOptions()}
      </div>
    );
  }
}

export default GTLFilter;
