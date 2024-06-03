import { app } from "./src/app.js"
import { createWebSocketServer } from "./src/websockets.js"

const port = 3000

const server = app.listen(port, () => {
  console.log("Server listening on http://localhost:" + port)
})

createWebSocketServer(server)
