'use strict'

let express = require('express')
let app = express()
let expressWs = require('express-ws')(app)
let clients = []

app.use('/', express.static('templates'))
app.use('/static', express.static('static'))

app.ws('/provider', (ws, request) => {
    const remoteAddress = request.connection.remoteAddress
    console.log(`client connected: ${remoteAddress}`)
    clients.push(ws)
    ws.on('message', (message) => {
        //ws.send(message)
        clients.forEach((client) => {
            client.send(message)
        })
    })
    ws.on('close', function() {
        clients = clients.filter((client) => client != ws)
        console.log(`client disconnected: ${remoteAddress}`)
    })
})

app.listen(8000, () => console.log('Express Server Started...'))
