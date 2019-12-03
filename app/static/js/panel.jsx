import React from "react";
import _ from "lodash";
import { Card, CardHeader, CardText } from 'material-ui';
import { Row, Col, FormControl, Form, Button, Well, Pagination,  } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
var baseColor = '#5866c5';

export default class Panel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          expanded: false,
          data: [],
          tweetId: props.tweetId,
          pos: '',
          neg: '',
          neutral: '',
          resetReplies: props.resetReplies,
          subpanelExpanded: false,
          url: props.url,
          tweetText: props.tweetText,
          articles: [],
          country: props.country,
        };
        this.handleExpandChange = this.handleExpandChange.bind(this);
    }
    componentWillReceiveProps(newProps) {
      if(this.state.tweetId !== newProps.tweetId) {
        this.setState({ tweetId: newProps.tweetId });
      }
      if(newProps.resetReplies && this.state.resetReplies !== newProps.resetReplies) {
        this.setState({ resetReplies: newProps.resetReplies, data: [], expanded: false, subpanelExpanded: false, articles: []});
      }
    }

    handleExpandChange(expanded) {
      this.setState({expanded: expanded });
      if(expanded && !_.isEmpty(this.state.tweetId) &&  _.isEmpty(this.state.data)) {
        fetch('http://127.0.0.1:5000/reply', {
          method: 'POST',
          body: JSON.stringify({id: this.state.tweetId})
        })
          .then(response => response.json())
          .then(data => this.setState({ data: data[0], pos: _.ceil(data[2] * 100, 2), neg: _.ceil(data[3] * 100, 2), neutral: _.ceil(data[4] * 100, 2)}));
      }
    }
    getData(data) {
      return _.map(data, (obj, ind) => this.showTweets(obj, ind));
    }

    showTweets(tweet, index) {
      console.log(tweet);
      const sentiment = (tweet['sentiment'] == 'positive') ? 'smile' : (tweet['sentiment'] == 'negative') ? 'frown' : 'meh';
      const color = (tweet['sentiment'] == 'positive') ? '#3fd63f' : (tweet['sentiment'] == 'negative') ? 'red' : 'orange';
      return (
        <div>
        <Well bsSize="large" key={index}>
          <label>{moment(_.split(tweet["tweet_date"], 'T')[0]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
          <label className="footer">
            <span><FontAwesomeIcon icon={["fas", "user"]} style={{ color: baseColor }}/> {tweet["name"]}, {tweet["country"]} { tweet["verified"][0] && <FontAwesomeIcon icon={["fas", "check-circle"]} style={{ color: baseColor }}/> } </span>
            <span>
             <a href={'https://'+tweet['link']} target="_blank">View Reply</a>
             <FontAwesomeIcon icon={["fas", sentiment]} size="2x" style={{ color: color }}/>
             </span>
           </label>
        </Well>
        </div>
      )
    }

    render () {
        let { data, articles } = this.state;
        return (
          <Card containerStyle={{background: '#fefefe', margin: '10 0 0'}} onExpandChange={this.handleExpandChange} expanded={this.state.expanded}>
             <CardHeader
               title="View Replies"
               actAsExpander={true}
               showExpandableButton={true}
               style={{padding: '8px 5px'}}
               titleStyle={{color: 'black'}}
               iconStyle={{color: 'black'}}
             />
             <CardText expandable={true} style={{color: 'black'}}>
             {!_.isEmpty(data) ?
              <div>
               <div className="text-center">Analytics on Replies -  <FontAwesomeIcon icon={["fas", 'smile']} size="lg" style={{ color: '#3fd63f' }}/>{this.state.pos} {' %  '}
               <FontAwesomeIcon icon={["fas", 'meh']} size="lg" style={{ color: 'orange' }}/> {this.state.neutral} {' %  '}
                <FontAwesomeIcon icon={["fas", 'frown']} size="lg" style={{ color: 'red' }}/> {this.state.neg}  {' %  '}</div>
                {this.getData(data)}
                </div>
                : <span>No replies Found</span>}
             </CardText>
           </Card>
        );
    }
}
