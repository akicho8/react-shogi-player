import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DangerButton from './DangerButton'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          日本語
        </p>
        <DangerButton />
      </div>
    );
  }
}

export default App;
