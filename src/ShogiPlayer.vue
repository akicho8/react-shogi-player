<template>
<div class="shogi-player" :class="{debug: debug_mode}">
  <!-- template v-if だとテスト時のみエラーになるため div v-show 形式にしている -->
  <!-- これは jest の問題なのか vue の不具合なのかわからない  -->
  <div v-show="error_message !== null">
    <div class="columns">
      <div class="column">
        <article class="message is-danger has-text-left">
          <div class="message-header">
            <p>ERROR</p>
          </div>
          <div class="message-body">
            <p>{{error_message}}></p>
          </div>
        </article>
      </div>
    </div>
  </div>

  <template v-if="!mediator">
    <i class="fas fa-spinner fa-pulse"></i>
  </template>

  <template v-if="mediator">
    <div class="turn_editor">
      <template v-if="!turn_edit">
        <span class="turn_edit_text" @click="turn_edit_run">{{mediator.normalized_turn}}手目</span>
      </template>
      <template v-if="turn_edit">
        <input type="number" v-model.number="turn_edit_value" @blur="turn_edit = false" ref="turn_edit_input" class="turn_edit_input">
      </template>
    </div>
    <div class="board_container board_turn" :class="{turned: board_turn}">
      <PieceStand :location_key="'white'"/>
      <div class="flex_item board_wrap">
        <div class="overlay_navi previous" @click.stop="navi_relative_move(-1, $event)"></div>
        <div class="overlay_navi next"     @click.stop="navi_relative_move(+1, $event)"></div>
        <div class="overlay_navi board_turn_area" @click="board_turn_run"></div>
        <table>
          <tr v-for="y in mediator.dimension">
            <template v-for="x in mediator.dimension">
              <td :class="mediator.cell_class(x -1, y - 1)">
                {{mediator.cell_view(x - 1, y - 1)}}
              </td>
            </template>
          </tr>
        </table>
      </div>
      <PieceStand :location_key="'black'"/>
    </div>
    <template v-if="controller_show">
      <div class="controller_block buttons has-addons is-centered">
        <button ref="first"    class="button first"      @click.stop="move_to_first">|◀</button>
        <button ref="previous" class="button previous"   @click.stop="relative_move(-1, $event)">◀</button>
        <button ref="next"     class="button next"       @click.stop="relative_move(+1, $event)">▶</button>
        <button ref="last"     class="button last"       @click.stop="move_to_last">▶|</button>
        <button                class="button board_turn" @click.stop="board_turn_run">{{board_turn ? '&#x21BA;' : '&#x21BB;'}}</button>
      </div>
    </template>

    <template v-if="slider_show">
      <input type="range" v-model.number="current_turn" :min="mediator.any_parser.turn_min" :max="mediator.any_parser.turn_max" ref="slider" />
    </template>

    <template v-if="!_.isEmpty(mediator.any_parser.comments_pack)">
      <template v-if="mediator.current_comments">
        <div class="columns">
          <div class="column is-three-fifths is-offset-one-fifth">
            <div class="content has-text-left">
              <template v-for="str in mediator.current_comments">
                <template v-if="_.isEmpty(str)">
                  <br>
                </template>
                <template v-else>
                  <div v-html="mediator.auto_link(str)"></div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </template>
    </template>
    <p class="is-size-7 has-text-grey" v-if="sfen_show">
    {{mediator.to_sfen}}
  </p>
  </template>

  <template v-if="debug_mode">
    <template v-if="mediator">
      <p>{{mediator.hold_pieces}}</p>
      <p>次の手番:{{mediator.location_next.key}}</p>
      <p>Sfen:{{mediator.to_sfen}}</p>
    </template>
    <p>read_counter: {{read_counter}}</p>
  </template>
</div>
</template>

<script>
import { Mediator } from "../mediator"
import PieceStand from "./piece_stand"
import _ from "lodash"
import axios from "axios"

// To use lodash's _ in the vue template
import Vue from 'vue'
Object.defineProperty(Vue.prototype, '_', {value: _})

// Log content type
// localStorage.debug = "axios"
require('axios-debug-log')({
  request: function (debug, config) {
    debug('Request with ' + config.headers['content-type'])
  },
  response: function (debug, response) {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url
    )
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error)
  }
})

const logger_debug = require('debug')('debug')

/* eslint-disable no-new */
export default {
  name: 'ShogiPlayer',

  /* eslint-disable */
  props: {
    kifu_body:                { type: String,  default: "position startpos", },
    kifu_url:                 { type: String,  default: null,                },
    polling_interval:         { type: Number,  default: null,                },
    move_to_last_after_polling:        { type: Boolean, default: true,                },
    turn_start:               { type: Number,  default: 0,                   },
    slider_show:              { type: Boolean, default: false,               },
    controller_show:          {                default: false,               },
    sfen_show:                { type: Boolean, default: false,               },
    global_key_event_capture: { type: Boolean, default: false                },
    location_hash_embed_turn: { type: Boolean, default: false,               },
    shift_key_mag:            { type: Number,  default: 10,                  },
    system_key_mag:           { type: Number,  default: 50,                  },
    debug_mode:               { type: Boolean, default: false,               }, // process.env.NODE_ENV !== 'production'
  },
  /* eslint-enable */

  components: {
    PieceStand,
  },

  data() {
    return {
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
  },

  created() {
    // this.log("created")
    this.kifu_read()
    this.polling_interval_update()
    this.mediator_update()
    document.addEventListener("keydown", this.keyboard_operation)
  },

  watch: {
    current_turn: function () {
      this.mediator_update()
    },
    turn_edit_value: function () {
      this.current_turn = this.turn_edit_value
    },

    /* eslint-disable */
    kifu_url:  function () { this.kifu_read() },
    kifu_body: function () { this.kifu_read() },
    loaded_kifu: function () {
      this.mediator_update()
    },
    polling_interval: function () { this.polling_interval_update() },
    /* eslint-enable */

    // 引数は親が「変更」したときがトリガー
    debug_mode: function (v) {
      this.log(`watch debug_mode: ${v}`)
    },
  },

  methods: {
    kifu_read() {
      if (this.kifu_url) {
        this.kifu_read_from_url()
      } else {
        this.loaded_kifu = this.kifu_body
      }
      this.read_counter++
      this.log(`read_counter: ${this.read_counter}`)
      if (this.move_to_last_after_polling) {
        this.current_turn = -1
      }
    },

    kifu_read_from_url() {
      const url = this.kifu_url
      // const url = "http://localhost:3000/wr/hanairobiyori-ispt-20171104_220810.kif"
      // const url = "http://tk2-221-20341.vs.sakura.ne.jp/shogi/wr/ureshino_friend-doglong-20180122_213544.kif"
      const accessd_at = Date.now().toString()
      axios.get(url, {
        params: {"accessd_at": accessd_at},
        responseType: "text",
        timeout: 1000 * 3,
        headers: {"X-SHOGI-PLAYER-TIMESTAMP": accessd_at},
      }).then((response) => {
        this.loaded_kifu = response.data
        this.error_message = null
      }).catch((error) => {
        if (error.response) {
          logger_debug("error.response.data: %o", error.response.data)
          logger_debug("error.response.status: %o", error.response.status)
          logger_debug("error.response.statusText: %o", error.response.statusText)
          logger_debug("error.response.headers: %o", error.response.headers)
        } else if (error.request) {
          logger_debug("error.request: %o", error.request)
        } else {
          logger_debug('error.message: %o', error.message)
        }
        logger_debug('error.config: %o', error.config)

        this.loaded_kifu = null
        this.error_message = error.message
      })
    },

    polling_interval_update() {
      if (this.polling_interval) {
        if (this.interval_id) {
          this.log(`clearInterval(${this.interval_id})`)
          clearInterval(this.interval_id)
        }
        this.interval_id = setInterval(() => { this.kifu_read() }, this.polling_interval * 1000)
        this.log(`setInterval() => ${this.interval_id}`)
      }
    },

    mediator_update() {
      if (this.loaded_kifu) {
        this.mediator = new Mediator()
        this.mediator.kifu_body = this.loaded_kifu
        this.mediator.current_turn = this.current_turn
        this.mediator.run()
        this.current_turn = this.mediator.normalized_turn
        if (this.location_hash_embed_turn) {
          document.location.hash = this.current_turn
        }
      }
    },

    keyboard_operation: function (e) {
      if (this.debug_mode) {
        this.log(document.activeElement)
        this.log(e.shiftKey, e.ctrlKey, e.altKey, e.metaKey)
        this.log("e", e)
        this.log("key", e.key)
        this.log("code", e.code)
      }

      if (!this.global_key_event_capture) {
        return
      }

      const dom = document.activeElement
      const controllers = [this.$refs.first, this.$refs.previous, this.$refs.next, this.$refs.last] // FIXME: 指定DOMの下にあるか？の方法がわかればもっと簡潔になる
      if (!(dom === undefined || dom.tagName === "BODY" || _.includes(controllers, dom))) {
        return
      }

      if (e.code === "Backspace" || e.code === "ArrowUp" || e.code === "ArrowLeft" || e.key === "k" || e.key === "p" || e.key === "b") {
        this.relative_move(-1, e)
        e.preventDefault()
      }

      if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowDown" || e.code === "ArrowRight" || e.key === "j" || e.key === "n" || e.key === "f") {
        this.relative_move(1, e)
        e.preventDefault()
      }

      // let gap = null
      // let force_value = null
      //
      // if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowDown" || e.code === "ArrowRight" || e.key === "j" || e.key === "n" || e.key === "f") {
      //   gap = 1
      // }
      // if (e.code === "Backspace" || e.code === "ArrowUp" || e.code === "ArrowLeft" || e.key === "k" || e.key === "p" || e.key === "b") {
      //   gap = -1
      // }
      // if (e.key === "PageUp") {
      //   gap = -10
      // }
      // if (e.key === "PageDown") {
      //   gap = 10
      // }
      // if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
      //   if (gap) {
      //     gap *= 10
      //   }
      // }
      // if (e.key === "[" || e.key === "Home" || e.code === "Escape") {
      //   force_value = this.mediator.any_parser.turn_min
      // }
      // if (e.key === "]" || e.key === "End") {
      //   force_value = this.mediator.any_parser.turn_max
      // }
      //
      // let v = this.current_turn
      // if (gap !== null) {
      //   v += gap
      // }
      // if (force_value !== null) {
      //   v = force_value
      // }
      // if (v < this.mediator.any_parser.turn_min) {
      //   v = this.mediator.any_parser.turn_min
      // }
      // if (this.mediator.any_parser.turn_max < v) {
      //   v = this.mediator.any_parser.turn_max
      // }
      // this.current_turn = v
      //
      // if (gap !== null || force_value !== null) {
      //   e.preventDefault()
      // }
    },

    navi_relative_move(v, event) {
      this.relative_move(v * this.board_turn_sign(), event)
    },

    relative_move(v, event = null) {
      if (event) {
        if (event.shiftKey) {
          if (this.shift_key_mag) {
            v *= this.shift_key_mag
          }
        }
        if (event.ctrlKey || event.altKey || event.metaKey) {
          if (this.system_key_mag) {
            v *= this.system_key_mag
          }
        }
      }

      const v2 = this.mediator.clamp(this.current_turn + v)
      if (this.current_turn !== v2) {
        this.current_turn = v2
      }
      if (this.debug_mode) {
        this.log([v, v2, this.current_turn])
      }
      if (this.focus_to("slider")) {
      } else {
        if (v > 0) {
          this.focus_to("next")
        } else {
          this.focus_to("previous")
        }
      }
    },

    move_to_first() {
      this.current_turn = this.mediator.any_parser.turn_min
      this.focus_to("slider") || this.focus_to("first")
    },

    move_to_last() {
      this.current_turn = this.mediator.any_parser.turn_max
      this.focus_to("slider") || this.focus_to("last")
    },

    focus_to(key) {
      const el = this.$refs[key]
      if (el) {
        el.focus()
        return true
      }
      return false
    },

    board_turn_run() {
      this.board_turn = !this.board_turn
      this.focus_to("slider")
    },

    turn_edit_run() {
      this.turn_edit = true
      this.turn_edit_value = this.current_turn
      this.$nextTick(() => { this.$refs.turn_edit_input.focus() })
    },

    board_turn_sign() {
      return this.board_turn ? -1 : 1
    },

    log(v) {
      if (this.debug_mode) {
        console.log(v)
      }
    },
  },
}
</script>

<style scoped lang="sass">
  @import "ShogiPlayer"
</style>
