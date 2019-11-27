import React from "react";
import Search from "./Search";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
require('../css/app.css');
var moment  = require('moment');
import _ from 'lodash';
import { Row, Col, FormControl, Form, Button, Well } from "react-bootstrap";
import { Drawer, Tabs, IconButton, Tab, Checkbox } from 'material-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var baseColor = '#5866c5';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import Chart from 'react-google-charts';

function Iframe(props) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: props.iframe ? props.iframe : "" }}
        />
      );
    }
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
          country: [],
          language: [],
          verified: false,
          date: '',
          dir: 'desc',
          sort: '',
          sentiment: [],
        };
        this.handleApply = this.handleApply.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.getGraph = this.getGraph.bind(this);

    }
    componentDidUpdate(prevProps, prevState)  {
      const { country, language, verified, date, sort, dir, sentiment } = this.state;
      if(prevState.country !== country || prevState.language !== language || prevState.verified !== verified || prevState.date !== date ||
        prevState.sort !== sort || prevState.dir !== dir || prevState.sentiment !== sentiment) {
        this.onSearch();
      }
      console.log(this.state.data, this.state);
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
      const color = (tweet['sentiment'] == 'positive') ? '#2bf52b' : (tweet['sentiment'] == 'negative') ? 'red' : 'orange';

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
        arr = _.map(label, (dt) => moment(dt).format());
      }
      if(!_.isEmpty(queryTerm)) {
        const params = {queryTerm: queryTerm, country: country, lang: language, date: arr, sentiment: sentiment, ...(verified && {verified: true}), ...(!_.isEmpty(sort) && {sort: sort, dir: dir})};
        console.log(params);
        fetch('http://127.0.0.1:5000/search', {
          method: 'POST',
          body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(data => this.setState({ data: data, searchClicked: true }));
      }
    }
    getData() {
      const object = this.state.data;
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
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'USA')}
                />
                <Checkbox
                  label="Brazil"
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'Brazil')}

                />
                <Checkbox
                  onCheck={(e, checked) => this.onCheck(checked, 'country', 'India')}
                  label="India"
                />
                <hr />
                <label>Language</label>
                <Checkbox
                  label="English"
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'en')}
                />
                <Checkbox
                  label="Hindi"
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'hi')}
                />
                <Checkbox
                  label="Portugese"
                  onCheck={(e, checked) => this.onCheck(checked, 'language', 'pt')}
                />
                <hr/>
                <Checkbox
                  label="Verified User"
                  onCheck={(e, checked) => this.onCheck(checked, 'verified')}
                />
                <hr/>
                <label>Sentiment</label>
                <Checkbox
                  label="Positive"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'positive')}
                />
                <Checkbox
                  label="Neutral"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'neutral')}
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
              <label className="space-between"><span>Found {_.size(this.state.data)} Records for <b>{this.state.queryTerm}</b>:</span>
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
              <div>{!_.isEmpty(this.state.data) && this.getData()}</div></div>}
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
