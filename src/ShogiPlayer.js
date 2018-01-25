import React from 'react'
import PieceStand from './PieceStand'
import _ from 'lodash'
import { Mediator } from './mediator'

class ShogiPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current_turn: this.turn_start, // N手目
      turn_edit_value: null,         // numberフィールドで current_turn を直接操作すると空にしたとき補正値 0 に変換されて使いづらいため別にする。あと -1 のときの挙動もわかりやすい。
      mediator: null,                // 局面管理
      board_turn: false,             // 反転したか？
      turn_edit: false,              // N手目編集中
      env: process.env.NODE_ENV,
      polling_id: null,
      loaded_kifu: null,
      error_message: null,
      interval_id: null,
      read_counter: 0,
    }
  }

  render() {

    return (
      <div>
        <PieceStand />
      </div>
    )
  }
}

// //prototypeプロパティで設定
// App.defaultProps = {text: '質問'};

        // <div className="board_container board_turn" className="{turned: board_turn}">
        //   <div className="flex_item board_wrap">
        //     <table>
        //       {_.times(Mediator.dimension, (y) => {
        //         return (
        //           <tr>
        //             {_.times(Mediator.dimension, (x) => {
        //               return (<td>{x}{y}</td>)
        //             })}
        //           </tr>)
        //       })}
        //     </table>
        // </div>
        // </div>






export default ShogiPlayer
