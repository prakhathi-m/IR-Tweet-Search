import React from "react";
import Search from "./Search";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
require('../css/app.css');
import moment from 'moment';
import _ from 'lodash';
import { FormControl, Form, Button, Well, Pagination,  } from "react-bootstrap";
import { Drawer, Tabs, IconButton, Tab, Checkbox, Card, CardHeader, CardText, List, ListItem } from 'material-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var baseColor = '#5866c5';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import Chart from 'react-google-charts';
import Panel from './panel.jsx';
import Graph from './graph.jsx';

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
          topic: [],
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
          resetReplies: false,
          article: [],
        };
        this.handleApply = this.handleApply.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.getPagination = this.getPagination.bind(this);
        this.onPageClick = this.onPageClick.bind(this);
        this.showTweets = this.showTweets.bind(this);
    }
    componentDidUpdate(prevProps, prevState)  {
      const { country, language, verified, date, sort, dir, sentiment, queryTerm, activeTab, topic } = this.state;
      if(prevState.country !== country || prevState.language !== language || prevState.verified !== verified || prevState.date !== date ||
        prevState.sort !== sort || prevState.dir !== dir || prevState.sentiment !== sentiment || prevState.topic !== topic) {
        this.onSearch();
      }
      if(prevState.activeTab !== activeTab && activeTab == 'article' && !_.isEmpty(queryTerm)) {
        fetch('http://127.0.0.1:5000/article', {
          method: 'POST',
          body: JSON.stringify({queryTerm: queryTerm})
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            this.setState({ article: data });
          });
      }
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
      return (
        <Well bsSize="large" key={tweet['id']}>
          <label>{moment(_.split(tweet["tweet_date"], 'T')[0]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
          <label className="footer">
            <span><FontAwesomeIcon icon={["fas", "user"]} style={{ color: baseColor }}/> {tweet["name"]}, {tweet["country"]} { tweet["verified"][0] && <FontAwesomeIcon icon={["fas", "check-circle"]} style={{ color: baseColor }}/> } </span>
            <span>
            <a href={'https://'+tweet['link']} target="_blank">View Tweet</a>
             <span><FontAwesomeIcon icon={["fas", "retweet"]} style={{ color: baseColor }}/> </span>
             <span>{tweet["retweet_count"]} </span>
             <span className="pad-5"><FontAwesomeIcon icon={["fas", "heart"]} style={{ color: baseColor }}/></span>
             {tweet["like_count"]} <FontAwesomeIcon icon={["fas", sentiment]} size="2x" style={{ color: color }}/>
             </span>
           </label>
           <label>Topic: {tweet['topic']}</label>
           <Panel tweetId={tweet['id']} resetReplies={this.state.resetReplies} />
        </Well>
      )
    }
    onSearch(e) {
      if (e) {
        e.preventDefault();
      }
      const {queryTerm, country, language, date, verified, sort, dir, sentiment, topic } = this.state;
      let arr = [];
      if(!_.isEmpty(date)) {
        let label = _.split(date, '-');
        arr = _.map(label, (dt) => moment(dt).format().slice(0,19)+'Z');
      }
      if(!_.isEmpty(queryTerm)) {
        const params = {queryTerm: queryTerm, country: country, lang: language, date: arr, topic: topic,
          sentiment: sentiment, ...(verified && {verified: true}), ...(!_.isEmpty(sort) && {sort: sort, dir: dir})};
        fetch('http://127.0.0.1:5000/search', {
          method: 'POST',
          body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(data => {
			      console.log(data[0], _.slice(data[0], 0, 10));
            this.setState({ data: data[0], searchClicked: true });
            const len = _.size(data[0]);
            if(len > 0) {
              this.setState({currentData: _.slice(data[0], 0, 10), currentPage:1, startPage: 1, finishPage: Math.floor(len/10)});
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
      this.setState({currentPage: number, currentData: dt, resetReplies: true});
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
    onCheck(isChecked, field, value) {
      if (field != 'verified') {
        const arr = isChecked ? _.uniq(_.concat(this.state[field], value)) : _.without(this.state[field], value);
        this.setState({[field]: arr});
      } else {
        this.setState({ verified: isChecked });
      }
    }
    showArticles(article) {
      const title = article[0];
      const url = article[1];
      return (
        <div className="article"><h6>{title}</h6><a href={url} target="_blank">{url}</a></div>
      );
    }
    getArticle(object) {
      return _.map(object, (obj) => this.showArticles(obj));
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
                   autoApply={false}
                   onCancel={() => this.setState({date: ''})}
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
                <List className="list">
                <Checkbox
                  label="Verified User"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'verified')}
                />
                <hr style={{'margin': '3px 0 10px'}} />
                <ListItem
                 primaryText="Country"
                 initiallyOpen={true}
                 primaryTogglesNestedList={true}
                 innerDivStyle={{'padding': '0px', fontSize: '14'}}
                 nestedListStyle={{'padding' : '0'}}
                 className="list"
                 nestedItems={[
               <ListItem
                 key={1}
                 innerDivStyle={{'padding': '0px', margin: '10px 0 0', fontSize: '14'}}
                 primaryText={<Checkbox
                   label="USA"
                   iconStyle={{fill: 'white'}}
                   onCheck={(e, checked) => this.onCheck(checked, 'country', 'USA')}
                />}
               />,
             <ListItem
                    key={2}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText={<Checkbox
                      label="Brazil"
                      onCheck={(e, checked) => this.onCheck(checked, 'country', 'Brazil')}
                      iconStyle={{fill: 'white'}}
                />}
              />,
             <ListItem
                  key={3}
                  innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                  primaryText={<Checkbox
                    iconStyle={{fill: 'white'}}
                    onCheck={(e, checked) => this.onCheck(checked, 'country', 'India')}
                    label="India"
            />}
                />]}/>
                <hr/>
                <ListItem
                 primaryText="Language"
                 initiallyOpen={true}
                 primaryTogglesNestedList={true}
                 innerDivStyle={{'padding': '0px', fontSize: '14'}}
                 nestedListStyle={{'padding' : '0'}}
                 className="list"
                 nestedItems={[
               <ListItem
                 key={1}
                 innerDivStyle={{'padding': '0px', margin: '10px 0 0', fontSize: '14'}}
                 primaryText={<Checkbox
                   label="English"
                   iconStyle={{fill: 'white'}}
                   onCheck={(e, checked) => this.onCheck(checked, 'language', 'en')}
                />}
               />,
             <ListItem
                    key={2}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText={<Checkbox
                      label="Hindi"
                      iconStyle={{fill: 'white'}}
                      onCheck={(e, checked) => this.onCheck(checked, 'language', 'hi')}
                />}
              />,
             <ListItem
                  key={3}
                  innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                  primaryText={<Checkbox
                    label="Portugese"
                    iconStyle={{fill: 'white'}}
                    onCheck={(e, checked) => this.onCheck(checked, 'language', 'pt')}
            />}
                />]}/>
                <hr/>
                <ListItem
                 primaryText="Sentiment"
                 initiallyOpen={true}
                 primaryTogglesNestedList={true}
                 innerDivStyle={{'padding': '0px', fontSize: '14'}}
                 nestedListStyle={{'padding' : '0'}}
                 className="list"
                 nestedItems={[
               <ListItem
                 key={1}
                 innerDivStyle={{'padding': '0px', margin: '10px 0 0', fontSize: '14'}}
                 primaryText={<Checkbox
                 label="Positive"
                 iconStyle={{fill: 'white'}}
                 onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'positive')}
                />}
               />,
             <ListItem
                    key={2}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText={<Checkbox
                    label="Neutral"
                    onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'neutral')}
                    iconStyle={{fill: 'white'}}
                />}
              />,
             <ListItem
                  key={3}
                  innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                  primaryText={<Checkbox
                  iconStyle={{fill: 'white'}}
                  label="Negative"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'negative')}
            />}
                />]}/>
                <hr/>
                <ListItem
             primaryText="Topic"
             initiallyOpen={true}
             primaryTogglesNestedList={true}
             innerDivStyle={{'padding': '0px', fontSize: '14'}}
             nestedListStyle={{'padding' : '0'}}
             className="list"
             nestedItems={[
               <ListItem
                 key={1}
                 innerDivStyle={{'padding': '0px', margin: '10px 0 0', fontSize: '14'}}
                 primaryText={<Checkbox
                 label="Crime"
                 iconStyle={{fill: 'white'}}
                 onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Crime')}
                />}
               />,
             <ListItem
                    key={2}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText={<Checkbox
                    iconStyle={{fill: 'white'}}
                    label="Disaster"
                    onCheck={(e,  checked) => this.onCheck(checked, 'topic', 'Disaster')}
                    />}
              />, <ListItem
                    key={3}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText={<Checkbox
                    iconStyle={{fill: 'white'}}
                    label="Entertainment"
                    onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Entertainment')}
                    />}
                /> , <ListItem
                    key={4}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText= {<Checkbox
                    iconStyle={{fill: 'white'}}
                    label="Religion"
                    onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Religion')}
                    />}
                />, <ListItem
                    key={5}
                    innerDivStyle={{'padding': '0px', margin: '0', fontSize: '14'}}
                    primaryText= {<Checkbox
                    iconStyle={{fill: 'white'}}
                    label="Politics"
                    onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Politics')}
                    />}/> ]}/>
                </List>
                <hr/>
            </Drawer>}
            <main>
            <form onSubmit={this.onSearch}>
            <div className="logo"></div>
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
            </form>
            <Tabs value={this.state.activeTab} className='tabs'
            tabItemContainerStyle={{background: '#fff', color:'black'}} inkBarStyle={{background: baseColor}}
              onChange={(val) => this.setState({activeTab: val})}>
              <Tab label="Search Results" value="search-result" className="search-tab">
              {!this.state.searchClicked && <div className="center"><p>Enter the query term and search!!! </p></div>}
              {(this.state.searchClicked && _.isEmpty(this.state.data)) && <div className="center"><p>No Results Found for {this.state.queryTerm}</p></div>}
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
              {this.state.data.length > 10 &&
              <div className="text-center">
                <Pagination>
                  {this.state.currentPage != this.state.startPage && <Pagination.First onClick={() => this.onPageClick(this.state.currentPage - 1)}/>}
                  {this.getPagination()}
                  {this.state.currentPage != this.state.finishPage && <Pagination.Last onClick={() => this.onPageClick(this.state.currentPage + 1)}/>}
                </Pagination>
                </div>
              }
                </div>
              }</div></div>}
              </Tab>
              <Tab label="Analytics" value="graph">
              {!this.state.searchClicked && <div className="center"><p>Enter the query term and search!!! </p></div>}
              {(this.state.searchClicked && _.isEmpty(this.state.data)) && <div className="center"><p>No Results Found for {this.state.queryTerm}</p></div>}
              {(this.state.searchClicked && this.state.data) && <Graph data={this.state.data}/>}
              </Tab>
              <Tab label="Articles" value="article">
              {!this.state.searchClicked && <div className="center"><p>Enter the query term and search!!! </p></div>}
              {(this.state.searchClicked && _.isEmpty(this.state.data)) && <div className="center"><p>No Results Found for {this.state.queryTerm}</p></div>}
              {(this.state.searchClicked && this.state.queryTerm && this.state.article) && <div style={{padding: '20px 10px'}}>{this.getArticle(this.state.article)}</div>}
              </Tab>
            </Tabs>
            </main>
          </div>
        );
    }
}
