import React from "react";
import Search from "./Search";

require('../css/fullstack.css');
var $ = require('jquery');

import HeaderBackgroundImage from '../images/header.jpg';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
          <div className='header-contents'>
                <Search />
          </div>
        );
    }
}
