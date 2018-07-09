import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'components/Widgets';
import './index.scss';

const TYPE_TITLE = 'title';
const TYPE_MORE = 'show_more';
const DATE_MAX_LENGTH = 7;
const SUFFIX = '@base@tag=imgScale&h=150&w=230&rotate=0&c=1&m=2';

export default
class ListItem extends PureComponent {
  static contextTypes = {
    router: PropTypes.object,
  };
  handleClick = () => {
    const { data } = this.props;
    const { id } = data;
    this.context.router.push(`/data/storeGTDetail/${id}`);
  }

  renderLeft = () => {
    const { data } = this.props;
    const { firstImg = {} } = data;
    const firstImgUrl = firstImg.tp;
    const url = (firstImgUrl + SUFFIX) || '';
    return (
      <div className="gt-list-item-img-container">
        <img className="gt-list-item-img" src={url} alt="" />
      </div>
    );
  }

  renderCity = () => {
    // 数据来源 Todo
    const { data } = this.props;
    const { realDeptCity, deptCity, extraTraffic } = data;

    const startCity = realDeptCity ? realDeptCity.map(item => item.name) : [];
    const city = deptCity ? deptCity.map(item => item.name) : [];
    // 数据处理
    let startSpan = null;
    if (Array.isArray(startCity) && startCity.length > 0) {
      let labelStartCity = '';
      if (extraTraffic) {
        if (extraTraffic === 1) {
          labelStartCity = '部分联运';
        } else if (extraTraffic === 2) {
          labelStartCity = '全国联运';
        }
      } else {
        labelStartCity = startCity.join('、');
      }
      startSpan = (
        <span className=""><span>{labelStartCity}</span><span>{!extraTraffic ? '出发 |' : ' |'}</span></span>
      );
    }
    let label = null;
    if (city) {
      label = ` ${city.join('、')}成团`;
    }
    if (!startSpan && !label) {
      return null;
    }
    // 数据渲染
    return (
      <div className="gt-list-item-city-label" key="city">
        {startSpan}{label}
      </div>
    );
  };

  renderTitle = () => {
    // todo 数据处理 & 数据来源
    const { data } = this.props;
    const { name, pid } = data;

    const title = name || '';
    const id = pid || '条目id';
    return (
      <div key="title" className="gt-list-item-title-label" data-id={id} data-type={TYPE_TITLE}>
        {title}
      </div>
    );
  };

  renderTag = () => {
    // 数据来源 Todo
    const { data: dataList } = this.props;
    const { sname, tag, highlight } = dataList;

    const source = sname || '';
    const fac = tag ? tag.map(item => item.name) : [];
    const facLabel = fac.join('、');
    const tags = highlight || [];
    const TAG_ARRAY =
    [
      {
        data: fac,
        className: 'gt-list-item-fac-label',
      },
      {
        data: tags,
        className: 'gt-list-item-tag-label',
      },
    ];
    // 数据处理
    let sourceSpan = null;
    if (source) {
      const label = `资源商：${source}`;
      sourceSpan = <span className="item-tag gt-list-item-source-label">{label}</span>;
    }
    let otherSpan = null;
    if (arrayHasData(fac) || arrayHasData(tags)) {
      otherSpan = [];
      TAG_ARRAY.forEach(({ data, className }, idx) => {
        if (Array.isArray(data)) {
          data.forEach((label, i) => {
            const key = String(idx + i) + label;
            if (idx) {
              otherSpan.push(<span className={`item-tag ${className} ${label.length > 0 && label.trim().length === 0 ? 'give-height' : ''}`} key={key}>{label}</span>);
            } else {
              otherSpan.push(
                <Tooltip
                  placement="bottom"
                  title={facLabel}
                >
                  <span className={`item-tag ${className} ${label.length > 0 && label.trim().length === 0 ? 'give-height' : ''}`} key={key}>{label}</span>
                </Tooltip>
              );
            }
          });
        }
      });
    }
    if (!sourceSpan && !otherSpan) {
      return null;
    }
    return (
      <div className="gt-list-item-tags-label-wrap" key="tag">
        {sourceSpan}{otherSpan}
      </div>
    );
  };

  renderPOI = () => {
    // 数据来源 Todo
    const { data } = this.props;
    const { attractions = [] } = data;

    const poi = attractions || [];
    // 数据处理
    let label = null;
    if (arrayHasData(poi)) {
      const poiLabel = poi.join('、');
      const poiTitle = '包含景点：';
      label = `${poiTitle}${poiLabel}`;
    }
    if (!label) {
      return null;
    }
    return (
      <div className="gt-list-item-poi-wrap over-hide" key="poi">{poi.length ? label : ''}</div>
    );
  };

  renderDate = () => {
    const { data } = this.props;
    const { availableDates = [] } = data;

    const date = availableDates ? availableDates.map(item => item.show) : [];
    // 数据来源 Todo
    if (!arrayHasData(date)) {
      return null;
    }
    const id = '条目id';
    let rightLabel = null;
    if (date.length > DATE_MAX_LENGTH) {
      rightLabel = <span className="gt-list-item-show-more" data-id={id} data-type={TYPE_MORE}>查看更多</span>;
      date.length = DATE_MAX_LENGTH;
    }
    const dateString = date.join('、');
    const label = <span className="gt-list-item-use-date">{`可用日期：${dateString}`}</span>;
    const dateIcon = <Icon size={12} type="calendar1" color="#595959" />;
    return (
      <div className="gt-list-item-date-wrap" key="date">{dateIcon}{label}{rightLabel}</div>
    );
  };

  renderCenter = () => {
    const infoContent = [];
    infoContent.push(this.renderCity());
    infoContent.push(this.renderTitle());
    infoContent.push(this.renderTag());
    infoContent.push(this.renderPOI());
    infoContent.push(this.renderDate());
    return (
      <div className="gt-list-item-info-container" >
        {infoContent}
      </div>
    );
  }

  renderRight = () => {
    const { data } = this.props;
    const { minPrice } = data;

    return (
      <div className="gt-list-item-price-container">
        <div className="gt-list-item-price-wrap">
          <span className="gt-list-item-price__label">￥{minPrice}</span>
          <span className="gt-list-item-price__tail">起</span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="gt-list-item" onClick={this.handleClick}>
        {
          this.renderLeft()
        }
        {
          this.renderCenter()
        }
        {
          this.renderRight()
        }
      </div>
    );
  }
}

function arrayHasData(array) {
  return Array.isArray(array) && array.length > 0;
}
