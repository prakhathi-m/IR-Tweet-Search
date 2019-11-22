import React from "react";
import Search from "./Search";

require('../css/fullstack.css');


export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
      console.log(this.props)
        return (
          <div className='header-contents'>
                <Search/>
          </div>
        );
    }
}
