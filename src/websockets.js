import { WebSocketServer } from "ws";
import ejs from "ejs";
import { db, getAllPolls } from "./db.js";

const connections = new Set();

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    connections.add(socket);
    console.log("New connection", connections.size);

    socket.on("close", () => {
      connections.delete(socket);
      console.log("Closed connection", connections.size);
    });
  });
};

export const sendPollsToAllConnections = async (user) => {
  if (!user) return;
  const polls = await getAllPolls();
  const unavailablePolls = await db("votes")
    .select("poll_id")
    .where("user_id", user.id);

  const pollsList = await ejs.renderFile("views/_polls.ejs", {
    user: user,
    polls: polls,
    unavailablePolls: unavailablePolls,
  });

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "pollsList",
        html: pollsList,
      })
    );
  }
  console.log("1 send message ");
};

/* export const changeInUser = async () => {
  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "changeInUser",
      }),
    )
  }
  console.log("1 send message changeInUser")
}
 */
