import React, { Component } from 'react';
import pureRender from 'pureRender-mj';
// import Divider from 'antd/lib/divider';

import { UltimateSuggestion } from 'mj-components';
import { Button } from 'mjui';
import { SearchBar } from '../../../components/Widgets';

import './index.scss';

const EternalDataSuggestion = UltimateSuggestion.EternalDataSuggestion;

@pureRender()
class GTLHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showHotCity: false,
      destroyKey: 0,
    };
  }

  componentDidUpdate() {
    if (this.ifAddEveListener) {
      document.removeEventListener('click', this.clickCallBack);
      this.ifAddEveListener = false;
    }
  }

  // 获取ref
  getRef = (name, ref) => {
    this[name] = ref;
  }

  // 点击切换热门城市弹窗显隐
  toggleHotCity = () => {
    const show = !this.state.showHotCity;
    this.setState({ showHotCity: show });
    if (show) {
      document.addEventListener('click', this.clickCallBack);
    }
  }

  clickCallBack = (e) => {
    this.ifAddEveListener = true;
    const path = _.get(e, 'path', []);
    for (let i = 0; i < path.length; i++) {
      const dom = path[i];
      if (dom.className && dom.className.includes('hotcity')) {
        return;
      }
    }
    this.setState({
      showHotCity: false,
    });
  }

  // 把获取到的城市转为二维数组
  toTwoArray = (arr) => {
    const newArr = [];
    let listId = 0;
    for (let i = 0; i < arr.length; i++) {
      listId += 1;
      newArr.push({ list: arr.slice(i, i + 6), id: listId });
      i += 5;
    }
    return newArr;
  }

  // 请求热门城市(搜索框联想)
  requestCity = (val) => {
    const { requestPtc005 } = this.props;
    return requestPtc005({
      key: val,
      mode: [1],
      filter: {
        citys: [],
        cityType: 3,
      },
    });
  };

  // 选择热门城市
  handleSelectCity = (option) => {
    if (!option) {
      return;
    }
    const { modifyGTListQuery, changeReducerVal, initListData } = this.props;
    const realDeptCity = {
      id: option && option.id,
      name: option && option.name,
    };
    const initFilter = initListData.getIn(['query', 'filter']).set('realDeptCity', realDeptCity);
    modifyGTListQuery(initFilter.toJS(), ['filter']);
    changeReducerVal(['realDeptCity'], realDeptCity, 2);
    changeReducerVal(['customPrice'], {
      from: '',
      to: '',
      fromErr: false,
      toErr: false,
    }, 2);
    changeReducerVal(['customTime'], null, 2);
    this.setState({ showHotCity: false, destroyKey: this.state.destroyKey + 1 });
  }

  // 搜索关键字
  handleSearch = (value) => {
    const { modifyGTListQuery, gtlState = Immutable.Map(), initListData } = this.props;
    const { changeReducerVal } = this.props;
    const keywords = gtlState.getIn(['query', 'filter', 'keywords']);
    const realDeptCity = gtlState.get('realDeptCity');
    const initFilter = initListData.getIn(['query', 'filter']).set('realDeptCity', realDeptCity).set('keywords', value);
    if (value === keywords) return;
    modifyGTListQuery(initFilter.toJS(), ['filter']);
    changeReducerVal(['customPrice'], {
      from: '',
      to: '',
      fromErr: false,
      toErr: false,
    }, 2);
    changeReducerVal(['customTime'], null, 2);
  }

  // 点击热门城市列表选择热门城市
  handleClick = (city) => {
    const { changeReducerVal, modifyGTListQuery, initListData } = this.props;
    const initFilter = initListData.getIn(['query', 'filter']).set('realDeptCity', city);
    modifyGTListQuery(initFilter.toJS(), ['filter']);
    changeReducerVal(['realDeptCity'], city, 2);
    changeReducerVal(['customPrice'], {
      from: '',
      to: '',
      fromErr: false,
      toErr: false,
    }, 2);
    changeReducerVal(['customTime'], null, 2);
    this.setState({ showHotCity: false, destroyKey: this.state.destroyKey + 1 });
  }

  // 渲染热门城市
  renderCity = () => {
    const { gtlState } = this.props;
    const hotDeptCity = gtlState.get('hotDeptCity') ? gtlState.get('hotDeptCity').toJS() : [];
    const citys = this.toTwoArray(hotDeptCity) || [];
    return (
      citys.map(item => (
        <div key={item.id} className="column">
          {
            item.list.map((city, index) => {
              const cid = index + 1;
              return <span key={cid} onClick={() => this.handleClick(city)}>{city.name}</span>;
            })
          }
        </div>
      ))
    );
  }

  render() {
    const { showHotCity, destroyKey } = this.state;
    const { gtlState } = this.props;
    const keywords = gtlState.getIn(['query', 'filter', 'keywords']);
    const realDeptCity = gtlState.get('realDeptCity') ? gtlState.get('realDeptCity').toJS().name : '北京';

    return (
      <div className="gtl-header">
        <div className="gtl-header-l">
          <span className="over-hide">{realDeptCity}</span>
          <Button
            className={`btn-toggle ${showHotCity && 'rotate'}`}
            type="noStyle"
            rightIcon="dropdown"
            onClick={this.toggleHotCity}
          >出发
          </Button>
        </div>
        <div className="gtl-header-r">
          <SearchBar
            key={destroyKey}
            placeholder="搜索目的地、产品名称"
            width={330}
            handleSearch={this.handleSearch}
            value={keywords}
          />
        </div>
        {
          showHotCity ?
            (
              <div className="hotcity" id="hotcity" ref={ref => this.getRef('hotCity', ref)}>
                <EternalDataSuggestion
                  customDataFirst
                  ifHasMatch
                  allowSearch
                  width={330}
                  placeholder="搜索出发城市"
                  onChange={this.requestCity}
                  onSelect={this.handleSelectCity}
                  popupContainer={() => document.getElementById('hotcity')}
                />
                <h4 ref={ref => this.getRef('citySpan', ref)}>热门城市</h4>
                <div className="city">
                  {
                    this.renderCity()
                  }
                </div>
              </div>
            ) : null
        }
      </div>
    );
  }
}

export default GTLHeader;
