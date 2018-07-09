import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import pureRender from 'pureRender-mj';

import { NewPage, ListViewLoading, Pagination } from 'components/Widgets';
import { changeReducerVal } from 'actions/common';
import { requestPtc001 } from 'actions/global';
import { saveAuth } from 'actions/auth';
import { requestPtc005 } from 'actions/suggestion';
import { requestPt008, modifyGTListQuery } from 'actions/gtStoreList';

import GTLHeader from './GTLHeader';
import GTLFilter from './GTLFilter';
import ListItem from './ListItem';

import './index.scss';


@pureRender()
class StoreGTList extends Component {
  constructor(props) {
    super(props);
    this.firstLoading = true;

    this.state = {
    };
  }

  initial = () => {
    // 初始化数据
    const { requestPtc001: _requestPtc001, requestPt008: _requestPt008 } = this.props;

    _requestPtc001().then((result) => {
      const hotDeptCity = _.get(result, ['data', 'hotDeptCity'], []);
      const tag = _.get(result, ['data', 'tag'], []);
      this.initListData = Immutable.fromJS({
        query: {
          page: 1,
          pageCnt: 20,
          filter: {
            keywords: '',
            deptCity: [],
            price: [],
            realDeptCity: { id: '', name: '北京' },
            tag: [],
            deptTime: [],
          },
        },
        customPrice: {
          from: '',
          to: '',
          fromErr: false,
          toErr: false,
        },
        hotDeptCity,
        customTime: null,
        listData: [],
        filter: {
          tag,
        },
        realDeptCity: { id: '', name: '北京' },
        isLoading: true,
        firstLoading: true,
        total: 0,
      });
      this.changeSListReducerVal([], this.initListData, 0);
      _requestPt008();
    });

    // const initListData = Immutable.fromJS({
    //   query: {
    //     page: 1,
    //     pageCnt: 20,
    //     filter: {
    //       keywords: '',
    //       deptCity: [],
    //       price: [],
    //       realDeptCity: { id: '', name: '北京' },
    //       tag: [],
    //       deptTime: [],
    //     },
    //   },
    //   customPrice: {
    //     from: '',
    //     to: '',
    //     fromErr: false,
    //     toErr: false,
    //   },
    //   hotDeptCity: [],
    //   customTime: null,
    //   listData: [],
    //   filter: {
    //     tag: [],
    //   },
    //   realDeptCity: { id: '', name: '北京' },
    //   isLoading: true,
    //   firstLoading: true,
    //   total: 0,
    // });
    // this.changeSListReducerVal([], initListData, 0);
    // _requestPt008();
  }

  changeSListReducerVal = (path, value, action) => {
    const { changeReducerVal: changeReducer } = this.props;

    changeReducer('gtStoreList', {
      path,
      value,
      action,
    });
  }

  changePage = (page) => {
    const { modifyGTListQuery: _modifyGTListQuery } = this.props;
    _modifyGTListQuery(page, ['page']);
  }

  renderListItem = () => {
    const { gtlState } = this.props;
    const listData = gtlState.get('listData') ? gtlState.get('listData').toJS() : [];
    const { total } = gtlState && gtlState.toJS();
    const page = gtlState && _.get(gtlState.toJS(), ['query', 'page'], 1);

    return (
      <div>
        {
          listData.map((item, index) => {
            const cid = index + 1;
            return (
              <ListItem
                key={cid}
                data={item}
              />
            );
          })
        }
        <Pagination
          current={page}
          total={total}
          pageSize={20}
          showQuickJumper
          onChange={this.changePage}
        />
      </div>
    );
  }

  renderContent = () => {
    const { requestPtc005: _requestPtc005, gtlState } = this.props;
    const { changeReducerVal: changeReducer, modifyGTListQuery: _modifyGTListQuery } = this.props;
    const { isLoading } = gtlState && gtlState.toJS();
    const { firstLoading } = gtlState && gtlState.toJS();
    const { total } = gtlState && gtlState.toJS();

    return (
      <div>
        <GTLHeader
          gtlState={gtlState}
          requestPtc005={_requestPtc005}
          changeReducerVal={this.changeSListReducerVal}
          modifyGTListQuery={_modifyGTListQuery}
          initListData={this.initListData}
        />
        <GTLFilter
          gtlState={gtlState}
          changeReducerVal={changeReducer}
          modifyGTListQuery={_modifyGTListQuery}
        />
        <div className="gtList-list">
          {!isLoading && total !== 0 ? this.renderListItem() : !isLoading ? <p className="no-res">无结果</p> : null}
          {
          !firstLoading && isLoading ?
            <ListViewLoading visible />
          : null
          }
        </div>
      </div>
    );
  }

  render() {
    const { username, gtlState } = this.props;
    const { firstLoading } = gtlState && gtlState.toJS();

    return (
      <NewPage
        className="new-page-gtList"
        username={username}
        saveAuth={this.props.saveAuth}
        afterSaveAuth={this.initial}
        loading={firstLoading}
      >
        <div className="gtList-wrap" id="storeGTList">
          <div className="gtList-content">
            {
              firstLoading !== undefined ?
                this.renderContent()
              : null
            }
          </div>
        </div>
      </NewPage>
    );
  }
}

function mapStateToProps(state) {
  const auth = state.get('auth') || Immutable.Map();
  const username = auth.get('name') || auth.get('nickname') || '';
  const gtlState = state.get('gtStoreList') || Immutable.Map();

  return {
    auth,
    username,
    gtlState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveAuth,
    changeReducerVal,
    requestPtc005,
    requestPt008,
    modifyGTListQuery,
    requestPtc001,
  }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(StoreGTList);
