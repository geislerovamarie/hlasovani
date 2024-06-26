import { WebSocketServer } from "ws"
import ejs from "ejs"
import { getAllPolls } from "./db.js"

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

export const sendPollsToAllConnections = async () => {
  const polls = await getAllPolls()
  const numPolls = polls.length

  const pollsList = await ejs.renderFile("views/_polls.ejs", {
    polls: polls,
  })

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "pollsList",
        html: pollsList,
        numPolls: numPolls,
      }),
    )
  }
}
