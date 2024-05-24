import { WebSocketServer } from "ws"
import ejs from "ejs"

const connections = new Set()

export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server })
  
    wss.on("connection", (socket) => {
      connections.add(socket)
      console.log("New connection", connections.size)
  
      socket.on("close", () => {
        connections.delete(socket)
        console.log("Closed connection", connections.size)
      })
    })
  }