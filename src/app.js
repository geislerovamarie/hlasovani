import express from "express"
import cookieParser from "cookie-parser"
import { getAllPolls } from "./db.js"
import { auth } from "./middlewares/auth.js"
import { loadUserFromCookie } from "./middlewares/loadUserFromCookie.js"
import { usersRouter } from "./routes/users.js"
import { pollsRouter } from "./routes/polls.js"

export const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(loadUserFromCookie)

// Home/root
app.get("/", auth, async (req, res) => {
  const polls = await getAllPolls()

  res.render("index", {
    title: "Hlasování",
    sender: res.locals.user,
    polls: polls,
  })
})

app.use(usersRouter)

app.use(pollsRouter)

// Errors =============================================
app.get("/register-error", async (req, res) => {
  res.render("register", {
    errorRegister: true,
    errorLogin: false,
  })
})

app.get("/register-login-error", async (req, res) => {
  res.render("register", {
    errorRegister: false,
    errorLogin: true,
  })
})

app.use((req, res) => {
  res.status(404)
  res.send("404 - Stránka nenalezena")
})

app.use((err, req, res) => {
  console.error(err)
  res.status(500)
  res.send("500 - Chyba na straně serveru")
})
