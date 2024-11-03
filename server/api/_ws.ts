export default defineWebSocketHandler({
  open(peer) {
    peer.send({ user: "server", message: `Welcome ${peer}!` })
    peer.publish("chat", { user: "server", message: `${peer} joined!` })
    peer.subscribe("chat")
  },
  message(peer, message) {
    const msg = {
      user: peer.toString(),
      message: message.toString(),
    }
    peer.send(msg) // echo
    peer.publish("chat", msg)
  },
  close(peer) {
    peer.publish("chat", { user: "server", message: `${peer} left!` })
    peer.unsubscribe("chat")
  },
});
