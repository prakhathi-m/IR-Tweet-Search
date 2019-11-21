import React from "react";
import { Button, Grid, Row, Col, InputGroup, FormControl } from "react-bootstrap";
var $ = require('jquery');

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        // This binding is necessary to make `this` work in the callback
        // this.state = {
        //   queryTerm: this.input.value,
        // };
        // this.onInputChange = this.onInputChange.bind(this);
    }

    // onInputChange(value) {
    //   this.setState({queryTerm: value})
    // }

    render () {
        return (
            <Grid>
                <Row>
                <Col md={4}>
                    <nav>
                     <ul>
                     <li>Filters:</li>
                     </ul>
                    </nav>
                    <hr/>
                </Col>
                <Col md={8}>
                    <Row>
                    <InputGroup>
                      <FormControl
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        inputRef={(ref) => {this.input = ref}}
                      />
                      <Button bsStyle="primary" bsSize="sm" onClick={this.onSearch}>Search</Button>
                    </InputGroup>
                    </Row>
                </Col>
                </Row>
                <Row>
                  // <h3>No Result found for: {this.state.queryTerm}</h3>
                </Row>
            </Grid>
        );
    }
}
