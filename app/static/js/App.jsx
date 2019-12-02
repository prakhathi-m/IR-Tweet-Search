import React from "react";
import Search from "./Search";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
require('../css/app.css');
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, FormControl, Form, Button, Well, Pagination,  } from "react-bootstrap";
import { Drawer, Tabs, IconButton, Tab, Checkbox, Card, CardHeader, CardText } from 'material-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var baseColor = '#5866c5';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import Chart from 'react-google-charts';
import Panel from './panel.js';

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
        this.getGraph = this.getGraph.bind(this);
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
 getGraph() {
		const data = this.state.data;
		console.log(data);
      const arr = _.map(data, (d) => d['retweet_count'] );
      const arr1 =  _.map(data, (d) => d['like_count'] );
	  const CountryArr = _.map(data, (d) => d['country'] );
	  const DateArr = _.map(data, (d) => d['tweet_date'] );
	  const SentimentArr = _.map(data, (d) => d['sentiment'] );
	  const LangArr = _.map(data, (d) => d['tweet_lang'] );
	  const TopicArr = _.map(data, (d) => d['topic'] );
	  console.log(TopicArr);
	  const Eng = [];
	  const Hin = [];
	  const Port = [];
	  const NA = [];
	  const Politics = [];
	  const Entertainment = [];
	  const Religion = [];
	  const Crime = [];
	  const Disaster = [];	  
	  const DateArray = [];
	  var Engdict = {};
	  var i = 0;
	  for(i=0;i<(DateArr.length);i++)
		  {
				DateArray.push(new Date(DateArr[i][0])); 		   	// Array of dates from json file.
		}

	    var datek;
		var month;
		var year;
		for(i=0;i<DateArray.length;i++)
		{DateArray[i] = new Date(DateArray[i]);
			datek = DateArray[i].getDate();
			month = DateArray[i].getMonth(); //Be careful! January is 0 not 1
			year = DateArray[i].getFullYear();
			DateArray[i] =  (month + 1)+ "-" +datek + "-" + year;
		}
		for(i=0;i<(LangArr.length);i++)
		  {
		  if (LangArr[i][0] == 'en') {
				Eng.push(LangArr[i][0]); }
		   else if (LangArr[i][0] == 'hi') {
				Hin.push(LangArr[i][0]);}
		   else if(LangArr[i][0] == 'pt') {
				Port.push(LangArr[i][0]);  }
		}
		for(i=0;i<(TopicArr.length);i++)
		  {
		  if (TopicArr[i][0] == 'Politics') {
				Politics.push(LangArr[i][0]); }
		   else if (TopicArr[i][0] == 'Entertainment') {
				Entertainment.push(LangArr[i][0]);}
		   else if(TopicArr[i][0] == 'Religion') {
				Religion.push(LangArr[i][0]);  }
		   else if (TopicArr[i][0] == 'Crime') {
				Crime.push(LangArr[i][0]);}
		   else if(TopicArr[i][0] == 'Disaster') {
				Disaster.push(LangArr[i][0]);  }
		   else if (TopicArr[i][0] == 'NA') {
				NA.push(LangArr[i][0]); }
		}
		const InDate = [];
		const BrazilDate = [];
		const USADate = [];
		const InCount = [];
		const BrazilCount = [];
		const USACount = [];
		const InTop = [];
		const BrazilTop = [];
		const USATop = [];
		const SentimentArray=[];
		//const changedInDate = []
		for(i=0;i<CountryArr.length;i++)
		{
			if (CountryArr[i][0] == 'India') {
			 InDate.push(DateArray[i]);  }
		   else if (CountryArr[i][0] == 'USA') {
				USADate.push(DateArray[i]);}
		   else if(CountryArr[i][0] == 'Brazil') {
				BrazilDate.push(DateArray[i]);  }
		}
		for(i=0;i<TopicArr.length;i++)
		{
			if (CountryArr[i][0] == 'India') {
			 InTop.push(TopicArr[i][0]);  }
		   else if (CountryArr[i][0] == 'USA') {
				USATop.push(TopicArr[i][0]);}
		   else if(CountryArr[i][0] == 'Brazil') {
				BrazilTop.push(TopicArr[i][0]);  }
		}
		for(i=0;i<SentimentArr.length;i++)
		{
			SentimentArray.push(SentimentArr[i][0]);
		}
		const IndiaCount = [];
		let unique = [...new Set(DateArray)];
		unique.sort();
		for(i=0;i<unique.length;i++){
			if((_.countBy(InDate)[unique[i]] ) == undefined )
			{
			InCount[i] = 0  }
			else {
			InCount[i] = _.countBy(InDate)[unique[i]]  }
		}

		for(i=0;i<unique.length;i++){
			if((_.countBy(USADate)[unique[i]] ) == undefined)
			{
			USACount[i] =0  }
			else {
			USACount[i] = _.countBy(USADate)[unique[i]]  }
		}
		for(i=0;i<unique.length;i++){
			if((_.countBy(BrazilDate)[unique[i]] ) == undefined )
			{
			BrazilCount[i] =0  }
			else {
			BrazilCount[i] = _.countBy(BrazilDate)[unique[i]]  }
		}
	   var Langdict = {'English': Eng.length, 'Hindi': Hin.length, 'Portugese': Port.length };
		for(i=0;i<(unique.length);i++)
		  {
				unique[i]= 	moment(unique[i]).subtract(10, 'days').calendar() ;	   	// Array of dates from json file.
		}
const sortedDates = unique.sort(function(a, b){

                    return new Date(a) - new Date(b);
                });
var Combined = new Array();
Combined[0] = ['sortedDates', 'India', 'USA','Brazil'];
for (var i = 0; i < unique.length; i++){
  Combined[i + 1] = [ sortedDates[i], InCount[i], USACount[i] ,BrazilCount[i]];
}
      return (<div>
	  <Chart   //LANG PIE CHART
  width='800'
  height='400'
  chartType="PieChart"
  loader={<div>Loading Chart</div>}

  data={[
    ['Language', 'Count'],
    ['English', Eng.length],
    ['Hindi', Hin.length],
    ['Portugese', Port.length],

  ]}
  options={{
    title: 'Distribution of tweets among languages',
    sliceVisibilityThreshold: 0,
  }}
  rootProps={{ 'data-testid': '7' }}
/>
<Chart   //GLOBAL LANG PIE CHART
  width='800'
  height='400'
  chartType="PieChart"
  loader={<div>Loading Chart</div>}

  data={[
    ['Language', 'Count'],
    ['English', 6869],
    ['Hindi', 1933],
    ['Portugese', 6968],

  ]}
  options={{
    title: 'Distribution of all tweets among languages',
    sliceVisibilityThreshold: 0,
  }}
  rootProps={{ 'data-testid': '7' }}
/>
  <Chart   //SENTIMENT PIE CHART
  width='800'
  height='400'
  chartType="PieChart"
  loader={<div>Loading Chart</div>}
  data={[
    ['Sentiment', 'Count'],
    ['Positive', _.countBy(SentimentArray)['positive']],
    ['Neutral', _.countBy(SentimentArray)['neutral']],
    ['Negative', _.countBy(SentimentArray)['negative']],

  ]}
  options={{
    title: 'Distribution of tweets among Sentiments',
    sliceVisibilityThreshold: 0, //
  }}
  rootProps={{ 'data-testid': '7' }}
/>
 <Chart   //GLOBAL SENTIMENT PIE CHART
  width='800'
  height='400'
  chartType="PieChart"
  loader={<div>Loading Chart</div>}
  data={[
    ['Sentiment', 'Count'],
    ['Positive', 5843],
    ['Neutral', 5707],
    ['Negative', 5736],

  ]}
  options={{
    title: 'Distribution of all tweets among Sentiments',
    sliceVisibilityThreshold: 0, //
  }}
  rootProps={{ 'data-testid': '7' }}
/>

 <p>Distribution of tweets across the World</p>


<Chart  // COUNTRY GEO CHART
  width='600'
  height='300'
  title= { 'Distribution of tweets across the World' }
  chartType="GeoChart"
  data={[
      ['Country', 'Count'],
    ['India', InDate.length],
    ['United States', USADate.length],
    ['Brazil', BrazilDate.length],
  ]}

  options={{

    colorAxis: { colors: ['#00853f', 'black', '#e31b23'] }

  }}
    // Note: you will need to get a mapsApiKey for your project.
  // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
  mapsApiKey="AIzaSyD95TGYrRBP0eUty1QxTlLsjpCrtjLKydo"
  rootProps={{ 'data-testid': '1' }}
/>
<Chart  // GLOBAL COUNTRY GEO CHART
  width='600'
  height='300'
  title= { 'Distribution of tweets across the World' }
  chartType="GeoChart"
  data={[
      ['Country', 'Count'],
    ['India', 5935],
    ['United States', 3791],
    ['Brazil', 7560],
  ]}

  options={{

    colorAxis: { colors: ['#00853f', 'black', '#e31b23'] }

  }}
    // Note: you will need to get a mapsApiKey for your project.
  // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
  mapsApiKey="AIzaSyD95TGYrRBP0eUty1QxTlLsjpCrtjLKydo"
  rootProps={{ 'data-testid': '1' }}
/>
<Chart
  width='100%'
  height='500'
  var table = {`google.visualization.arrayToDataTable(Combined, false);`}
  chartType="Line"
  loader={<div>Loading Chart</div>}
  data={ Combined }
  options={{
    chart: {
      title:
        'Time Series of tweets among different Countries',
    },
    width: 900,
    height: 500,
    axes: {
      // Adds labels to each axis; they don't have to match the axis names.
      y: {
        Count: { label: 'Count' },

      },
    },
  }}
  rootProps={{ 'data-testid': '4' }}
/>
<Chart
  width={'500px'} 
  height={'300px'}
  chartType="Bar"
  loader={<div>Loading Chart</div>}
  data={[
    ['Country', 'Politics', 'Crime', 'Entertainment','Disaster', 'Religion'],
    ['India',  _.countBy(InTop)['Politics'],  _.countBy(InTop)['Crime'],  _.countBy(InTop)['Entertainment'], _.countBy(InTop)['Disaster'], _.countBy(InTop)['Religion']],
    ['Unites States',  _.countBy(USATop)['Politics'],  _.countBy(USATop)['Crime'],  _.countBy(USATop)['Entertainment'], _.countBy(USATop)['Disaster'], _.countBy(USATop)['Religion']],
    ['Brazil',  _.countBy(BrazilTop)['Politics'],  _.countBy(BrazilTop)['Crime'],  _.countBy(BrazilTop)['Entertainment'], _.countBy(BrazilTop)['Disaster'], _.countBy(BrazilTop)['Religion']],    
  ]}
  options={{
    
    chart: {
      title: 'Distribution of tweet topics among Countries',
      //subtitle: 'Sales, Expenses, and Profit: 2014-2017',
    },
  }}
  // For tests
  rootProps={{ 'data-testid': '2' }}
/>
<Chart
  width={'500px'} 
  height={'300px'}
  chartType="Bar"
  loader={<div>Loading Chart</div>}
  data={[
    ['Country', 'Politics', 'Crime', 'Entertainment','Disaster', 'Religion'],
    ['India',  1346,  450,  385, 56,476],
    ['Unites States',  1853, 727, 329, 123,258],
    ['Brazil', 1668,  209, 200, 206, 196],    
  ]}
  options={{
    
    chart: {
      title: 'Distribution of all tweet topics among Countries',
      //subtitle: 'Sales, Expenses, and Profit: 2014-2017',
    },
  }}
  // For tests
  rootProps={{ 'data-testid': '2' }}
/>
</div>
		);
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
                  label="Negative"
                  onCheck={(e, checked) => this.onCheck(checked, 'sentiment', 'negative')}
                />
                <hr/>
                <label>Topic</label>
                <Checkbox
                  label="Crime"
                  iconStyle={{fill: 'white'}}
                  onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Crime')}
                />
                <Checkbox
                  label="Politics"
                  onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Politics')}
                  iconStyle={{fill: 'white'}}
                />
                <Checkbox
                  iconStyle={{fill: 'white'}}
                  label="Disaster"
                  onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Disaster')}
                />
                <Checkbox
                  iconStyle={{fill: 'white'}}
                  label="Entertainment"
                  onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Entertainment')}
                />
                <Checkbox
                  iconStyle={{fill: 'white'}}
                  label="Religion"
                  onCheck={(e, checked) => this.onCheck(checked, 'topic', 'Religion')}
                />
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
              {(this.state.searchClicked && this.state.data) && this.getGraph()}
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
