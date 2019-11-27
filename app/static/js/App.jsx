import React from "react";
import Search from "./Search";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
require('../css/app.css');
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, FormControl, Form, Button, Well, Pagination } from "react-bootstrap";
import { Drawer, Tabs, IconButton, Tab, Checkbox } from 'material-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var baseColor = '#5866c5';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import Chart from 'react-google-charts';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          drawerState: true,
          startDate: '',
          endDate: '',
          queryTerm: '',
          activeTab: 'search-result',
          searchClicked: false,
          data: [],
          country: [],
          language: [],
          verified: false,
          date: '',
          dir: 'desc',
          sort: '',
          sentiment: [],
          currentPage: 1,
          totalDocs: '',
          startPage: 1,
          finishPage: 10,
          currentData: [],
        };
        this.handleApply = this.handleApply.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.getGraph = this.getGraph.bind(this);
        this.getPagination = this.getPagination.bind(this);
        this.onPageClick = this.onPageClick.bind(this);
    }
    componentDidUpdate(prevProps, prevState)  {
      const { country, language, verified, date, sort, dir, sentiment, currentPage, startPage, data } = this.state;
      if(prevState.country !== country || prevState.language !== language || prevState.verified !== verified || prevState.date !== date ||
        prevState.sort !== sort || prevState.dir !== dir || prevState.sentiment !== sentiment) {
        this.onSearch();
      }
      if(prevProps.currentPage !== currentPage) {
            if(currentPage - startPage > 6 ) {
              this.setState({startPage: currentPage, finishPage: currentPage + 10});
            } else if (currentPage - startPage <=2 && currentPage > 6) {
              this.setState({startPage: currentPage - 4, finishPage: currentPage + 6});
            }
        }
        const dt = _.slice(data, (currentPage-1)*10 +1, currentPage*10 +1);
    }
    handleApply(evt, picker) {
      let { startDate, endDate } = picker;
      let label = '';
      let start = startDate && moment(startDate).format('YYYY/MM/DD') || '';
      let end = endDate && moment(endDate).format('YYYY/MM/DD') || '';
      label = start + ' - ' + end;
      if (start === end) {
        label = start;
      }
      this.setState({
        startDate: startDate,
        endDate: endDate,
        date: label,
      });
    }
    showTweets(tweet) {
      const sentiment = (tweet['sentiment'] == 'positive') ? 'smile' : (tweet['sentiment'] == 'negative') ? 'frown' : 'meh';
      const color = (tweet['sentiment'] == 'positive') ? '#3fd63f' : (tweet['sentiment'] == 'negative') ? 'red' : 'orange';
      console.log(tweet["tweet_date"], moment(tweet["tweet_date"]).format('LL'));
      return (
        <Well bsSize="large">
          <label>{moment(tweet["tweet_date"]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
          <label className="footer">
            <span><FontAwesomeIcon icon={["fas", "user"]} style={{ color: baseColor }}/> {tweet["name"]}, {tweet["country"]} { tweet["verified"] && <FontAwesomeIcon icon={["fas", "check-circle"]} style={{ color: baseColor }}/> } </span>
            <span>
            <a href={'https://'+tweet['link']} target="_blank">View Tweet</a>
             <span><FontAwesomeIcon icon={["fas", "retweet"]} style={{ color: baseColor }}/> </span>
             <span>{tweet["retweet_count"]} </span>
             <span className="pad-5"><FontAwesomeIcon icon={["fas", "heart"]} style={{ color: baseColor }}/></span>
             {tweet["like_count"]} <FontAwesomeIcon icon={["fas", sentiment]} size="2x" style={{ color: color }}/>
             </span>
           </label>
        </Well>
      )
    }
    onSearch() {
      const {queryTerm, country, language, date, verified, sort, dir, sentiment } = this.state;
      let arr = [];
      if(!_.isEmpty(date)) {
        let label = _.split(date, '-');
        arr = _.map(label, (dt) => moment(dt).format().slice(0,19)+'Z');
      }
      if(!_.isEmpty(queryTerm)) {
        const params = {queryTerm: queryTerm, country: country, lang: language, date: arr, sentiment: sentiment, ...(verified && {verified: true}), ...(!_.isEmpty(sort) && {sort: sort, dir: dir})};
        console.log(params);
        fetch('http://127.0.0.1:5000/search', {
          method: 'POST',
          body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(data => {
            this.setState({ data: data, searchClicked: true });
            if(_.size(data) > 0) {
              this.setState({currentData: _.slice(data, 1, 11), currentPage:1, startPage: 1, finishPage: 10});
            }
          });
      }
    }
    onPageClick(number) {
      const { startPage, finishPage, data} = this.state;
      let dt = _.slice(data, 1, 11);
      if (number > 1) {
        dt = _.slice(data, (number-1)*10 +1, number*10 +1);
      }
      this.setState({currentPage: number, currentData: dt});
      console.log(number, startPage, finishPage, dt);
    }
    getPagination() {
      const {currentPage, startPage, finishPage, data} = this.state;
      const items = []
      for (let number = startPage; number <= finishPage; number++) {
        items.push(
          <Pagination.Item key={number} active={number === this.state.currentPage} onClick={() => this.onPageClick(number)}>
            {number}
          </Pagination.Item>,
        );
      }
      return items;
    }
    getData() {
      const object = this.state.currentData;
      return _.map(object, (obj) => this.showTweets(obj));
    }
    getGraph() {

    }
    onCheck(isChecked, field, value) {
      if (field != 'verified') {
        const arr = isChecked ? _.uniq(_.concat(this.state[field], value)) : _.without(this.state[field], value);
        this.setState({[field]: arr});
      } else {
        this.setState({ verified: isChecked });
      }
    }
    render () {
      const { startDate, endDate, date } = this.state;
      const locale = {
        format: 'YYYY/MM/DD',
        cancelLabel: 'Clear',
      };
      const {drawerState} = this.state.drawerState;
        return (
          <div className='header-contents'>
          {drawerState ? <Button onClick={() => {this.setState({drawerState: !drawerState})}}><FontAwesomeIcon icon={["fas", "bars"]} style={{ color: 'white' }}/></Button>
          :
          <Drawer
            className="drawer"
            width={250}
            containerClassName="drawer-cont"
            open={this.state.drawerState}
            containerStyle={{padding: 10}}
            overlayStyle={{'background': '#fff'}}
            onRequestChange={(open) => this.setState({drawerState: open})}
            >
                <label className="space-between"><span>Filters</span>
                <Button onClick={() => {this.setState({drawerState: !drawerState})}}>
                <FontAwesomeIcon icon={["fas", "filter"]} style={{ color: 'white' }}/></Button></label>
                <DatetimeRangePicker
                   startDate={this.state.startDate}
                   endDate={this.state.endDate}
                   onApply={this.handleApply}
                   locale={locale}
                   autoUpdateInput
                   autoApply
                >
                <div className="input-group filter">
                <input type="text" className="form-control" value={date} readOnly/>
                  <span className="input-group-btn">
                      <Button className="default date-range-toggle">
                        <i className="fa fa-calendar"/>
                      </Button>
                  </span>
              </div>
                </DatetimeRangePicker>
                <label style={{'margin': '10px 0'}}>Country</label>
                <Checkbox
                  label="USA"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'USA')}
                />
                <Checkbox
                  label="Brazil"
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'Brazil')}
                  iconStyle={{fill: 'white'}}
                />
                <Checkbox
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'India')}
                  label="India"
                />
                <hr />
                <label>Language</label>
                <Checkbox
                  label="English"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'en')}
                />
                <Checkbox
                  label="Hindi"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'hi')}
                />
                <Checkbox
                  label="Portugese"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'pt')}
                />
                <hr/>
                <Checkbox
                  label="Verified User"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'verified')}
                />
                <hr/>
                <label>Sentiment</label>
                <Checkbox
                  label="Positive"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'positive')}
                />
                <Checkbox
                  label="Neutral"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'neutral')}
                  iconStyle={{fill: 'white'}}
                />
                <Checkbox
                  iconStyle={{fill: 'white'}}
                  label="Neutral"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'negative')}
                />
                <hr/>
            </Drawer>}
            <main>
            <div className="search-bar">
              <FormControl
                placeholder="Search"
                aria-label="Search"
                aria-describedby="basic-addon2"
                onChange={(input) => this.setState({queryTerm: input.target.value})}
                id="search-input"
                style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              />
              <Button className="search-button" onClick={this.onSearch} style={{background: baseColor, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}>
                <i className="fa fa-search search-icon" style={{"color": '#f5f5f5'}} /> </Button>
            </div>
            <Tabs value={this.state.activeTab} className='tabs'
            tabItemContainerStyle={{background: '#fff', color:'black'}} inkBarStyle={{background: baseColor}}
              onChange={(val) => this.setState({activeTab: val})}>
              <Tab label="Search Results" value="search-result" className="search-tab">
              {!this.state.searchClicked && <p>Enter the query term and search!!! </p>}
              {(this.state.searchClicked && _.isEmpty(this.state.data)) && <p>No Results Found for {this.state.queryTerm}</p>}
              {(this.state.searchClicked && !_.isEmpty(this.state.data)) && <div>
              <label className="space-between"><span>Showing page {this.state.currentPage}. Found {_.size(this.state.data)} Records for <b>{this.state.queryTerm}</b>:</span>
                <div className="flex sort-bar">
                <span>Sort By: </span>
                <FormControl componentClass="select" value={this.state.sort} onChange={(e) => this.setState({ sort: e.target.value })}>
                  <option value="" className="hide"></option>
                  <option value="tweet_date">Date</option>
                  <option value="retweet_count">Retweet</option>
                  <option value="like_count">Likes</option>
                </FormControl>
                <span className={this.state.dir == 'asc' ? 'box active' : 'box'} onClick={() => this.setState({dir: 'asc'})}><FontAwesomeIcon icon={["fas", "arrow-up"]} style={{ color: baseColor }}/></span>
                <span className={this.state.dir == 'desc' ? 'box active' : 'box'} onClick={() => this.setState({dir: 'desc'})}><FontAwesomeIcon icon={["fas", "arrow-down"]} style={{ color: baseColor }}/></span>
                </div>
              </label>
              <div>{!_.isEmpty(this.state.data) && <div>{this.getData()}
              <div className="text-center">
                <Pagination>
                  <Pagination.First onClick={() => this.onPageClick(this.state.currentPage - 1)}/>
                  {this.getPagination()}
                  <Pagination.Last onClick={() => this.onPageClick(this.state.currentPage + 1)}/>
                </Pagination>
                </div>
                </div>
              }</div></div>}
              </Tab>
              <Tab label="Analytics" value="graph">
              <p>New Graph</p>
              <div id="graph"></div>
              {(this.state.searchClicked && this.state.data) && this.getGraph()}
              </Tab>
            </Tabs>
            </main>
          </div>
        );
    }
}
