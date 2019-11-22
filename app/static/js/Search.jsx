import React from "react";
import { Button, Grid, Row, Col, InputGroup, FormControl, Form,
  ListGroup, ListGroupItem, Checkbox, Nav, NavItem } from "react-bootstrap";
import _ from "lodash";

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          queryTerm: '',
          data: [],
        };
        this.onSearch = this.onSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.onKeyPressEvent = this.onKeyPressEvent.bind(this);
    }
    componentDidMount(){
      const input = document.getElementById('search-input');
      input.addEventListener('keyPress', this.onKeyPressEvent);
    }
    componentWillUnmount() {
      const input = document.getElementById('search-input');
      input.removeEventListener('keyPress', this.onKeyPressEvent);
    }
    onKeyPressEvent(evt) {
      console.log('listeningg')
      if(evt.keyCode == 27) {
        console.log('clicked')
        this.onSearch();
      }
    }
    onCheck(value) {
      console.log(value.target.checked, value.target.value);
    }
    onSearch() {
      fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        body: JSON.stringify({queryTerm: this.state.queryTerm})
      })
        .then(response => response.json())
        .then(data => this.setState({ data: data }));
    }
    getData() {
      const object = this.state.data;
      return _.map(object, (obj) => (<p><span>{obj['poi_name']}</span><span>{obj['tweet_text']}</span></p>));
    }
    render () {
        return (
            <Grid>
            <Form onSubmit={this.onSearch}>
                <Row className="wrapper">
                <Col md={3} className="side-nav">
                    <nav>
                    <h5>Filters:</h5>
                    <Checkbox
                      id='country-filter' onChange={(value) => this.onCheck(value)}>
                      Country</Checkbox>
                     <Checkbox
                        id='lang-filter'>
                        Language</Checkbox>
                    <Checkbox
                          id='lang-filter'>Verified User</Checkbox>
                    </nav>
                    <hr/>
                </Col>
                <Col md={8} className="main-content">
                <Row>
                <InputGroup>
                  <FormControl
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="basic-addon2"
                    onChange={(input) => this.setState({queryTerm: input.target.value})}
                    id="search-input"
                  />
                  <Button bsStyle="primary" bsSize="sm" onClick={this.onSearch}>Search</Button>
                </InputGroup>
                </Row>
                <Row>
                  <h3>Results for <b>{this.state.queryTerm}</b>:</h3>
                  <div>{!_.isEmpty(this.state.data) && this.getData()}</div>
                </Row>
                </Col>
                </Row>
                </Form>
            </Grid>
        );
    }
}
