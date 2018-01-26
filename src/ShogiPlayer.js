import React from 'react'
import _ from 'lodash'
import { Mediator } from './mediator'
import { Board } from './board'
import { Piece } from "./piece"
import { Location } from "./location"

import "./ShogiPlayer.css"
import "./PieceStand.css"

class PieceStand extends React.Component {
  get location() {
    return Location.fetch(this.props.location_key)
  }

  get hold_pieces() {
    const list = Array.from(this.props.mediator.hold_pieces.get(this.location.key))
    return _(list)
      .filter(([key, count]) => count >= 1)
      .map(([key, count]) => [Piece.fetch(key), count])
      .sortBy(list, ([key, count]) => key.code)
      .value()
  }

  get custom_classes() {
    const list = []
    list.push("flex_item")
    list.push("piece_stand")
    list.push(`location_${this.location.key}`)
    if (this.props.mediator.location_next.key === this.location.key) {
      list.push("turn_active")
    }
    return list
  }

  render() {
    const list = []
    for (const [piece, count] of this.hold_pieces) {
      list.push(
        <li>
          <span className={piece.css_class_list.join(' ')}>{piece.name}</span>
          <span className="piece_count">{count >= 2 ? count : ""}</span>
        </li>)
    }

    return (
      <div className={this.custom_classes.join(" ")}>
        <ul>
          <li className="location_mark">{this.location.name}</li>
          {list}
        </ul>
      </div>
    )
  }
}

class ShogiPlayer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current_turn: this.props.turn_start,
    }
  }

  current_turn_update(e) {
    this.setState({current_turn: Number(e.target.value)})
  }

  render() {
    const mediator = new Mediator()
    mediator.kifu_body = this.props.kifu_body
    mediator.current_turn = this.state.current_turn
    mediator.run()

    const tbody_block = []
    _.times(Board.dimension, (y) => {
      const row = []
      _.times(Board.dimension, (x) => {
        row.push(<td className={mediator.cell_class(x, y).join(" ")}>{mediator.cell_view(x, y)}</td>)
      })
      tbody_block.push(<tr>{row}</tr>)
    })

    const slider_block = []
    slider_block.push(<input type="range" value={this.state.current_turn} onChange={this.current_turn_update.bind(this)} min={mediator.any_parser.turn_min} max={mediator.any_parser.turn_max} />)

    return (
      <div className="shogi-player">
        <div>{this.state.current_turn}手目</div>
        <div className="board_container board_turn">
          <PieceStand location_key="white" mediator={mediator} />
          <div className="flex_item board_wrap">
            <table>
              <tbody>{tbody_block}</tbody>
            </table>
          </div>
          <PieceStand location_key="black" mediator={mediator} />
        </div>
        {slider_block}
      </div>
    )
  }
}

ShogiPlayer.defaultProps = {
  kifu_body: "position startpos",
  turn_start: 0,
}

export default ShogiPlayer
