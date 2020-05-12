import flask
import werkzeug
import gevent.pywsgi
import geventwebsocket.handler

clients = []

app = flask.Flask(__name__)


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/provider')
def provider():
    ws = flask.request.environ.get('wsgi.websocket')
    if ws:
        remote_addr = flask.request.headers.get(
            "X-Forwarded-For",
            flask.request.remote_addr
        )
        print('Connected from {}'.format(remote_addr))
        clients.append(ws)
        while True:
            message = ws.receive()
            if message is None:
                break
            for client in clients:
                client.send(message)
        print('Disconnected from {}'.format(remote_addr))
        clients.remove(ws)
    raise werkzeug.exceptions.BadRequest()


if __name__ == '__main__':
    import argparse
    import os
    import gevent.socket as gsocket

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--host', type=str, default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--unix', type=str, default=None)
    parser.add_argument('--backlog', type=int, default=16)
    args = parser.parse_args()

    if args.unix is not None:
        try:
            os.remove(args.unix)
        except FileNotFoundError:
            pass
        listener = gsocket.socket(gsocket.AF_UNIX, gsocket.SOCK_STREAM)
        listener.bind(args.unix)
        listener.listen(args.backlog)
        os.chmod(args.unix, 0o666)
    else:
        listener = (args.host, args.port)
    server = gevent.pywsgi.WSGIServer(
        listener,
        app,
        handler_class=geventwebsocket.handler.WebSocketHandler
    )
    server.serve_forever()
