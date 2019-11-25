import React from "react";
import { Grid, Row, Col, InputGroup, FormControl, Form, Button,
  ListGroup, ListGroupItem, Checkbox, Nav, NavItem, Well } from "react-bootstrap";
import _ from "lodash";
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
var moment  = require('moment');
var baseColor = '#5866c5';
import Card from 'material-ui/Card';
export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          queryTerm: '',
          data: [],
          startDate: '',
          endDate: '',
        };
        this.onSearch = this.onSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.handleApply = this.handleApply.bind(this);
    }
    onCheck(value) {
      console.log(value.target.checked, value.target.value);
    }
    onSearch(e) {
      e.preventDefault();
      fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        body: JSON.stringify({queryTerm: this.state.queryTerm})
      })
        .then(response => response.json())
        .then(data => this.setState({ data: data }));
    }
    showTweets(tweet) {
      console.log(tweet);
      return (
        <Well bsSize="large">
          <label>{moment(tweet["tweet_date"]).format('MMM DD, YYYY')} - {tweet['tweet_text']}</label>
          <label className="footer"><span>{tweet["name"]}, {tweet["country"]} { tweet["verified"] && <FontAwesomeIcon icon={["fas", "check-circle"]} style={{ color: baseColor }}/> } </span>
          <span><FontAwesomeIcon icon={["fas", "retweet"]} style={{ color: baseColor }}/> {tweet["retweet_count"]  } <FontAwesomeIcon icon={["fas", "heart"]} style={{ color: baseColor }}/> {tweet["like_count"]}</span></label>
        </Well>
      )
    }
    getData() {
      const object = this.state.data;
      return _.map(object, (obj) => this.showTweets(obj));
    }
    handleApply(evt, picker) {
      this.setState({
        startDate: picker.startDate,
        endDate: picker.endDate,
      });
    }
    render () {
        let { startDate, endDate } = this.state;

        let label = '';
        let start = startDate && moment(startDate).format('YYYY/MM/DD') || '';
        let end = endDate && moment(endDate).format('YYYY/MM/DD') || '';
        label = start + ' - ' + end;
        if (start === end) {
          label = start;
        }
        let locale = {
          format: 'YYYY/MM/DD',
          cancelLabel: 'Clear',
        };
        return (
            <Form onSubmit={this.onSearch}>
                <Row className="wrapper" noGutters>
                <Col md={2} className="side-nav">
                    <aside>
                    <h5>Filters:</h5>

                    <DatetimeRangePicker
                       startDate={this.state.startDate}
                       endDate={this.state.endDate}
                       onApply={this.handleApply}
                       locale={locale}
                       autoUpdateInput
                       autoApply
                    >
                    <div className="input-group">
                    <input type="text" className="form-control" value={label} readOnly/>
                      <span className="input-group-btn">
                          <Button className="default date-range-toggle">
                            <i className="fa fa-calendar"/>
                          </Button>
                      </span>
                  </div>
                    </DatetimeRangePicker>
                    <label>Country</label>
                    <Checkbox
                      id='usa-filter' onChange={(value) => this.onCheck(value)}>
                      USA</Checkbox>
                    <Checkbox
                        id='brazil-filter' onChange={(value) => this.onCheck(value)}>
                        Brazil</Checkbox>
                    <Checkbox
                          id='india-filter' onChange={(value) => this.onCheck(value)}>
                          India</Checkbox>
                    <label>Language</label>
                     <Checkbox
                          id='en-filter' onChange={(value) => this.onCheck(value)}>
                        English</Checkbox>
                    <Checkbox
                             id='hindi-filter' onChange={(value) => this.onCheck(value)}>
                           Hindi</Checkbox>
                    <Checkbox
                       id='brazil-filter' onChange={(value) => this.onCheck(value)}>
                       Brazil</Checkbox>
                    <hr />
                    <Checkbox
                          id='lang-filter'>Verified User</Checkbox>
                    </aside>
                    <hr/>
                </Col>
                <Col md={9} className="main-content">
                <main>
                <Row>
                  <FormControl
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                    onChange={(input) => this.setState({queryTerm: input.target.value})}
                    id="search-input"
                  />
                  <Button className="search-button" onClick={this.onSearch} style={{background: baseColor}}>
                    <i className="fa fa-search search-icon" style={{"color": '#f5f5f5'}} /> </Button>
                </Row>
                <div>
                  <label>Results for {this.state.queryTerm}:</label>
                  <div>{!_.isEmpty(this.state.data) && this.getData()}</div>
                </div>
                </main>
                </Col>
                </Row>
                </Form>
        );
    }
}
