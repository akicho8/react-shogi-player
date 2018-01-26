import React from 'react'
import logo from './logo.svg'
import made_with_bulma from './made-with-bulma.png'

import './App.css'
import ShogiPlayer from './ShogiPlayer'

import kif_sample2 from './sample1_kif'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <section className="hero is-primary">
          <div className="hero-head">
            <nav className="navbar">
              <div className="container">
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
                React版
              </h2>
            </div>
          </div>

          <div className="hero-foot">
            <nav className="tabs">
              <div className="container">
                <ul>
                  <li><a href="#summary">概要</a></li>
                  <li><a href="#examples">サンプル</a></li>
                </ul>
              </div>
            </nav>
          </div>
        </section>

        <section className="section">
          <a name="summary"></a>
          <div className="container">
            <h2 className="title">概要</h2>
            <hr/>
            <div className="content">
              <p>
                将棋の棋譜を再生する JavaScript で次の特徴があります
              </p>
              <ul>
                <li>KIF と SFEN フォーマットに対応</li>
                <li>Flash 未使用</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <a name="examples"></a>
          <div className="container">
            <h2 className="title">サンプル</h2>
            <hr/>
            <section className="section">
              <div className="container has-text-centered">

                <div className="columns">
                  <div className="column">
                    <h3 className="title yumincho">藤井聡太四段 vs 佐藤天彦名人</h3>
                    <p className="subtitle yumincho">
                      <a href="http://www.asahi.com/shougi/asahicup_live/?ref=jsa" target="_blank">第11回朝日杯将棋オープン戦本戦</a>
                    </p>
                    <hr/>
                    {/* <ShogiPlayer :kifu_body="kif_sample2" :turn_start="9" :slider_show="true" :global_key_event_capture="true" /> */}
                    <ShogiPlayer kifu_body={kif_sample2} turn_start="9" slider_show="true" global_key_event_capture="true" />
                  </div>
                </div>
              </div>

            </section>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="columns">
              <div className="column has-text-centered">
                <a href="https://bulma.io"><img src={made_with_bulma} alt="Made with Bulma" width="128" height="24" /></a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    );
  }
}

export default App
