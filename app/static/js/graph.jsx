import React from "react";
require('../css/app.css');
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, FormControl, Form, Button, Well, Pagination,  } from "react-bootstrap";
import Chart from 'react-google-charts';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          data: props.data,
          graph: 'lang_dis',
        };
        // this.renderGraph = this.renderGraph.bind(this);
    }
    componentWillReceiveProps(newProps)  {
      const { data } = this.state;
      if(newProps.data !== data ) {
        this.setState({data: newProps.data});
      }
    }

    getLangGraph(data) {
        const LangArr = _.map(data, (d) => d['tweet_lang'] );
    	  const Eng = [];
    	  const Hin = [];
    	  const Port = [];
    	  var Engdict = {};
    		for(let i=0;i<(LangArr.length);i++)
    		  {
    		  if (LangArr[i][0] == 'en') {
    				Eng.push(LangArr[i][0]); }
    		   else if (LangArr[i][0] == 'hi') {
    				Hin.push(LangArr[i][0]);}
    		   else if(LangArr[i][0] == 'pt') {
    				Port.push(LangArr[i][0]);  }
    		}
  	   var Langdict = {'English': Eng.length, 'Hindi': Hin.length, 'Portugese': Port.length };
      return (
        <div className="flex">
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
            title: '(QUERY DATA) Language Distribution',
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
            title: '(GLOBAL DATA) Language Distribution',
            sliceVisibilityThreshold: 0,
          }}
          rootProps={{ 'data-testid': '7' }}
        />
     </div>);
   }

   getSentiGraph(data) {
   	  const SentimentArr = _.map(data, (d) => d['sentiment'] );
   		const SentimentArray=[];
   		for(let i=0;i<SentimentArr.length;i++)
   		{
   			SentimentArray.push(SentimentArr[i][0]);
   		}
    return (<div className="flex">
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
           title: '(QUERY DATA) Sentiment Distribution',
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
           title: '(GLOBAL DATA) Sentiment Distribution',
           sliceVisibilityThreshold: 0, //
         }}
         rootProps={{ 'data-testid': '7' }}
       />

        </div> );
  }

  getGeoGraph(data) {
  	  const CountryArr = _.map(data, (d) => d['country'] );
      const CountryArray = [];
  	  for(let i=0;i<CountryArr.length;i++)
      {
        CountryArray.push(CountryArr[i][0]);
      }
        return (<div className="flex">
        <div>
        <p>(QUERY DATA) Tweet Distribution across the World</p>
      <Chart  // COUNTRY GEO CHART
        width='500'
        height='300'
        style={{'border': '1px solid gray', 'margin': '0 2px'}}
        title= { 'Distribution of tweets across the World' }
        chartType="GeoChart"
        data={[
            ['Country', 'Count'],
          ['India', _.countBy(CountryArray)['India']],
          ['United States', _.countBy(CountryArray)['USA']],
          ['Brazil', _.countBy(CountryArray)['Brazil']],
        ]}

        options={{
			title: '(QUERY DATA) Distribution of tweets among languages',
          colorAxis: { colors: ['#00853f', 'black', '#e31b23'] }
        }}
          // Note: you will need to get a mapsApiKey for your project.
        // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
        mapsApiKey="AIzaSyD95TGYrRBP0eUty1QxTlLsjpCrtjLKydo"
        rootProps={{ 'data-testid': '1' }}
      />
      </div>
      <div>
      <p>(GLOBAL DATA) Tweet Distribution across the World</p>
      <Chart  // GLOBAL COUNTRY GEO CHART
        width='500'
        height='300'
        title= { 'Distribution of tweets across the World' }
        style={{'border': '1px solid gray', 'margin': '0 2px'}}
        chartType="GeoChart"
        data={[
            ['Country', 'Count'],
          ['India', 5935],
          ['United States', 3791],
          ['Brazil', 7560],
        ]}

       /*  options={{
			title: '(QUERY DATA) Distribution of tweets among languages',
          colorAxis: { colors: ['#00853f', 'black', '#e31b23'] }
        }} */
		options={{colorAxis: { colors: ['#00853f', 'black', '#e31b23'] },
				 chart: {
                title: '(QUERY DATA) Topic Distribution Among Countries',
              },             }}
          // Note: you will need to get a mapsApiKey for your project.
        // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
        mapsApiKey=" *YOUR API KEY* "
        rootProps={{ 'data-testid': '1' }}/>
        </div>
        </div>);
      }
 getRetLikeGraph(data) {
    		return (<div className="flex">
    				<Chart
  width={'800px'}
  height={'300px'}
  chartType="PieChart"
  loader={<div>Loading Chart</div>}
  data={[

    ['POI', 'Retweet Count'],
    ['AOC', 9216583],
    ['narendramodi', 5702319],
    ['AmitShah', 2145252],
    ['ShashiTharoor', 243435],
    ['BarackObama', 9399500],
    ['SenSanders',4759616 ],
    ['dilmabr', 1189527],
    ['jairbolsonaro', 10958976],
    ['MarinaSilva', 574126],
  ]}
  options={{
    title: '(GLOBAL DATA) Retweet Distribution',
    // Just add this option
    is3D: true,
  }}
  rootProps={{ 'data-testid': '2' }}
 /> <Chart
  width={'800px'}
  height={'300px'}
  chartType="PieChart"
  loader={<div>Loading Chart</div>}
  data={[

    ['POI', 'Retweet Count'],
    ['AOC',43438002 ],
    ['narendramodi', 29602696],
    ['AmitShah', 11788661],
    ['ShashiTharoor', 1426707],
    ['BarackObama', 44009307],
    ['SenSanders',15942328 ],
    ['dilmabr',3846213 ],
    ['jairbolsonaro', 70669214],
    ['MarinaSilva',3192856 ],
  ]}
  options={{
    title: '(GLOBAL DATA) Likes Distribution',
    // Just add this option
    is3D: true,
  }}
  rootProps={{ 'data-testid': '2' }}
 />

          </div>);
  }
  getTopicGraph(data) {
    	  const CountryArr = _.map(data, (d) => d['country'] );
    	  const TopicArr = _.map(data, (d) => d['topic'] );
    	  const General = [];
    	  const Politics = [];
    	  const Entertainment = [];
    	  const Religion = [];
    	  const Crime = [];
    	  const Disaster = [];
    		for(let i=0;i<(TopicArr.length);i++)
    		  {
    		  if (TopicArr[i][0] == 'Politics') {
    				Politics.push(CountryArr[i][0]); }
    		   else if (TopicArr[i][0] == 'Entertainment') {
    				Entertainment.push(CountryArr[i][0]);}
    		   else if(TopicArr[i][0] == 'Religion') {
    				Religion.push(CountryArr[i][0]);  }
    		   else if (TopicArr[i][0] == 'Crime') {
    				Crime.push(CountryArr[i][0]);}
    		   else if(TopicArr[i][0] == 'Disaster') {
    				Disaster.push(CountryArr[i][0]);  }
    		   else if (TopicArr[i][0] == 'NA') {
    				General.push(CountryArr[i][0]); }
    		}
    		const InTop = [];
    		const BrazilTop = [];
    		const USATop = [];
    		for(let i=0;i<TopicArr.length;i++)
    		{
    			if (CountryArr[i][0] == 'India') {
    			 InTop.push(TopicArr[i][0]);  }
    		   else if (CountryArr[i][0] == 'USA') {
    				USATop.push(TopicArr[i][0]);}
    		   else if(CountryArr[i][0] == 'Brazil') {
    				BrazilTop.push(TopicArr[i][0]);  }
    		}
    		return (<div className="flex">

          <Chart
            width='600'
            height='300'
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
                title: '(QUERY DATA) Topic Distribution Among Countries',
              },             }}

            rootProps={{ 'data-testid': '2' }}
          />
          <Chart
            width='600'
            height='300'
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
                title: '(GLOBAL DATA) Overall Topic Distribution Among Countries',
              },
            }}
            rootProps={{ 'data-testid': '2' }}
          />
          </div>);
  }

  getTimeGraph(data) {
		console.log(data);
	  const CountryArr = _.map(data, (d) => d['country'] );
	  const DateArr = _.map(data, (d) => d['tweet_date'] );
	  const DateArray = [];
	  for(let i=0;i<(DateArr.length);i++)
		  {
				DateArray.push(new Date(DateArr[i][0])); 		   	// Array of dates from json file.
		}
	    var datek;
		var month;
		var year;
		for(let i=0;i<DateArray.length;i++)
		{DateArray[i] = new Date(DateArray[i]);
			datek = DateArray[i].getDate();
			month = DateArray[i].getMonth(); //Be careful! January is 0 not 1
			year = DateArray[i].getFullYear();
			DateArray[i] =  (month + 1)+ "-" +datek + "-" + year;
		}
		const InDate = [];
		const BrazilDate = [];
		const USADate = [];
		const InCount = [];
		const BrazilCount = [];
		const USACount = [];
		for(i=0;i<CountryArr.length;i++)
		{
			if (CountryArr[i][0] == 'India') {
			 InDate.push(DateArray[i]);  }
		   else if (CountryArr[i][0] == 'USA') {
				USADate.push(DateArray[i]);}
		   else if(CountryArr[i][0] == 'Brazil') {
				BrazilDate.push(DateArray[i]);  }
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
<Chart
  width='700'
  height='500'
  var table = {`google.visualization.arrayToDataTable(Combined, false);`}
  chartType="Line"
  loader={<div>Loading Chart</div>}
  data={ Combined }
  options={{
    chart: {
      title: '(QUERY DATA) Time Series of Tweets among Countries',
    },
    width: 700,
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
</div>
		);
    }

    render () {
      const {graph, data} = this.state;
        return (
          <div className=''>
          <div className="text-center">
          <FormControl componentClass="select" value={graph} style={{width: '250px', margin: '10px auto'}} onChange={(e) => this.setState({ graph: e.target.value })}>
            <option value="lang_dis">Language Distribution</option>
            <option value="sentiment_dis">Sentiment Distribution</option>
            <option value="geo_dis">Geographical Distribution</option>
            <option value="time_series">Time Series</option>
            <option value="topic_dis">Topic Distribution</option>
            <option value="popular">Popularity Analysis</option>
          </FormControl>
          </div>
          {graph == 'lang_dis' && this.getLangGraph(data)}
          {graph == 'sentiment_dis' && this.getSentiGraph(data)}
          {graph == 'time_series' && this.getTimeGraph(data)}
          {graph == 'geo_dis' && this.getGeoGraph(data)}
          {graph == 'topic_dis' && this.getTopicGraph(data)}
           {graph == 'popular' && this.getRetLikeGraph()}
          </div>
        );
    }
}
