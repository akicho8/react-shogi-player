import React from 'react';
import logo from './logo.svg';
import './App.css';
// import DangerButton from './DangerButton'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <section className="hero is-primary">
          <div className="hero-head">
            <nav className="navbar">
              <div className="container">
                {/* <img src={logo} className="App-logo" alt="logo" /> */}
                <div className="navbar-brand">
                  <span className="navbar-burger burger" data-target="navbarMenuHeroA">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
                <div id="navbarMenuHeroA" className="navbar-menu">
                  <div className="navbar-end">
                    <a className="navbar-item" href="https://github.com/akicho8/react-shogi-player">
                      <span className="icon">
                        <i className="fas fa-github"></i>
                      </span>
                      <span>Github</span>
                    </a>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <div className="hero-body">
            <div className="container has-text-centered">
              <h1 className="title">
                shogi-player
              </h1>
              <h2 className="subtitle">
              </h2>
            </div>
          </div>

          <div className="hero-foot">
            <nav className="tabs">
              <div className="container">
                <ul>
                  <li><a href="#summary">概要</a></li>
                  <li><a href="#examples">サンプル</a></li>
                  <li><a href="#usage">使い方</a></li>
                  <li><a href="#options">オプション</a></li>
                </ul>
              </div>
            </nav>
          </div>
        </section>
      </div>
    );
  }
}

export default App
