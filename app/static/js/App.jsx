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
        <Well bsSize="large">
          <label>{moment(_.split(tweet["tweet_date"], 'T')[0]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
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
        fetch('http://127.0.0.1:5000/search', {
          method: 'POST',
          body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(data => {
			console.log(data[0], _.slice(data[0], 0, 10));
            this.setState({ data: data[0], searchClicked: true });
            const len = _.size(data);
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
      this.setState({currentPage: number, currentData: dt});
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
      const arr = _.map(data, (d) => d['retweet_count'] );
      const arr1 =  _.map(data, (d) => d['like_count'] );
	  const CountryArr = _.map(data, (d) => d['country'] );
	  const DateArr = _.map(data, (d) => d['tweet_date'] );
	  const SentimentArr = _.map(data, (d) => d['sentiment'] );
	  const LangArr = _.map(data, (d) => d['tweet_lang'] );	  
	  const Eng = [];
	  const Hin = [];
	  const Port = [];  
	  const DateArray = [];
	  var Engdict = {};
	  var i = 0;	  
	  
	  for(i=0;i<(DateArr.length);i++)
		  {		  
				DateArray.push(DateArr[i][0]); 		   	// Array of dates from json file.	  
		}
	  var datek;
		var month;
		var year;
		for(i=0;i<DateArray.length;i++)
		{DateArray[i] = new Date(DateArray[i]);
			datek = DateArray[i].getDate();
			month = DateArray[i].getMonth(); //Be careful! January is 0 not 1
			year = DateArray[i].getFullYear();
			DateArray[i] = datek + "-" +(month + 1) + "-" + year; 
			
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

		const InDate = [];
		const BrazilDate = [];
		const USADate = [];
		const InCount = [];
		const BrazilCount = [];
		const USACount = [];
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
	  
	  DateArray.sort();
	  
	  var Combined = new Array();
Combined[0] = ['DateArray', 'India', 'USA','Brazil'];
for (var i = 0; i < unique.length; i++){
  Combined[i + 1] = [ unique[i], InCount[i], USACount[i] ,BrazilCount[i]];
}
//second parameter is false because first row is headers, not data.

      return (<div> 
	  <Chart   //LANG PIE CHART
  width={'800px'}
  height={'400px'}
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
  <Chart   //SENTIMENT PIE CHART
  width={'800px'}
  height={'400px'}
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

 <p>Distribution of tweets across the World</p>


<Chart  // COUNTRY GEO CHART
  width={'600px'}
  height={'300px'}
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

{'                             '}  

		


<Chart

  width={'100%'}
  height={'500'}
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
    /* series: {
      // Gives each series an axis name that matches the Y-axis below.
      0: { axis: 'Temps' },
      1: { axis: 'Daylight' },
    }, */
    axes: {
      // Adds labels to each axis; they don't have to match the axis names.
      y: {
        Count: { label: 'Count' },
        
      },
    },
  }}
  rootProps={{ 'data-testid': '4' }}
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
              <div id="graph"></div>
              {(this.state.searchClicked && this.state.data) && this.getGraph()}
              </Tab>
            </Tabs>
            </main>
          </div>
        );
    }
}
