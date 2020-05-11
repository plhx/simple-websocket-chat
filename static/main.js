// main.js

let ChatClient = function(url) {
    let self = this
    self.ws = new WebSocket(url)
    self.ws.addEventListener('message', function(message) {
        self.recv(message)
    })
}

ChatClient.prototype.send = function(data) {
    this.ws.send(JSON.stringify(data))
}

ChatClient.prototype.recv = function(message) {

}

$(function() {
    let client = new ChatClient('ws://' + window.location.host + '/provider')
    client.recv = function(event) {
        let data = JSON.parse(event.data)
        messageView.add(data)
    }

    let formView = new Vue({
        el: '.form-view',
        data: {
            name: '名無しさん',
            message: '',
            color: '#000000',
            colorTable: [
                '#000000', '#808080', '#800000', '#808000',
                '#008000', '#008080', '#000080', '#800080'
            ]
        },
        methods: {
            post: function() {
                if(this.name && this.message && this.color) {
                    client.send({
                        name: this.name,
                        message: this.message,
                        color: this.color,
                        timestamp: new Date().getTime() / 1000
                    })
                    this.message = ''
                }
            }
        }
    })

    let messageView = new Vue({
        el: '.message-view',
        data: {
            maxlines: 20,
            message: []
        },
        methods: {
            add: function(data) {
                this.message = [data].concat(this.message).slice(0, this.maxlines)
            },
            fromTimestamp: function(timestamp) {
                let zfill = function(x, digits, padding) {
                    let s = '' + x
                    while(s.length < digits)
                        s = (padding || '0') + s
                    return s
                }
                let dt = new Date(timestamp * 1000)
                let s = zfill(dt.getFullYear(), 4)
                    + '/' + zfill(dt.getMonth() + 1, 2)
                    + '/' + zfill(dt.getDate(), 2)
                let t = zfill(dt.getHours(), 2)
                    + ':' + zfill(dt.getMinutes(), 2)
                    + ':' + zfill(dt.getSeconds(), 2)
                return s + ' ' + t
            }
        }
    })
})
