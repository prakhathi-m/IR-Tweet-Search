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
        };
        this.handleExpandChange = this.handleExpandChange.bind(this);
    }
    componentWillReceiveProps(newProps) {
      if(this.state.tweetId !== newProps.tweetId) {
        this.setState({ tweetId: newProps.tweetId });
      }
    }

    handleExpandChange(expanded) {
      console.log(expanded, this.state);
      this.setState({expanded: expanded });
      if(!_.isEmpty(this.state.tweetId) && _.isEmpty(this.state.data)) {
        fetch('http://127.0.0.1:5000/reply', {
          method: 'POST',
          body: JSON.stringify({id: this.state.tweetId})
        })
          .then(response => response.json())
          .then(data => this.setState({ data: data[0] }));
      }
    }

    getData(data) {
      console.log(data);
      return _.map(data, (obj, ind) => this.showTweets(obj, ind));
    }

    showTweets(tweet, index) {
      console.log(tweet);
      const sentiment = (tweet['sentiment'] == 'positive') ? 'smile' : (tweet['sentiment'] == 'negative') ? 'frown' : 'meh';
      const color = (tweet['sentiment'] == 'positive') ? '#3fd63f' : (tweet['sentiment'] == 'negative') ? 'red' : 'orange';
      return (
        <Well bsSize="large" key={index}>
          <label>{moment(_.split(tweet["tweet_date"], 'T')[0]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
          <label className="footer">
            <span><FontAwesomeIcon icon={["fas", "user"]} style={{ color: baseColor }}/> {tweet["name"]}, {tweet["country"]} { tweet["verified"] && <FontAwesomeIcon icon={["fas", "check-circle"]} style={{ color: baseColor }}/> } </span>
            <span>
             <span><FontAwesomeIcon icon={["fas", "retweet"]} style={{ color: baseColor }}/> </span>
             <span>{tweet["retweet_count"]} </span>
             <span className="pad-5"><FontAwesomeIcon icon={["fas", "heart"]} style={{ color: baseColor }}/></span>
             {tweet["like_count"]} <FontAwesomeIcon icon={["fas", sentiment]} size="2x" style={{ color: color }}/>
             </span>
           </label>
        </Well>
      )
    }

    render () {
        let { data } = this.state;

        return (
          <Card containerStyle={{background: '#fefefe', margin: '10 0 0'}} onExpandChange={this.handleExpandChange} expanded={this.state.expanded}>
             <CardHeader
               title="View Replies"
               actAsExpander={true}
               showExpandableButton={true}
               titleStyle={{color: 'black'}}
               iconStyle={{color: 'black'}}
             />
             {!_.isEmpty(data) &&
             <CardText expandable={true} style={{color: 'black'}}>
                {this.getData(data)}
             </CardText>
           }
           </Card>
        );
    }
}
