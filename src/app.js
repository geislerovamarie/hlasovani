import express, { request } from "express"
import cookieParser from "cookie-parser"
import {
  db,
  createUser,
  getUser,
  loginAlreadyUsed,
  getAllPolls,
} from "./db.js"
import { sendPollsToAllConnections } from "./websockets.js"
import { auth } from "./middlewares/auth.js"
import { loadUserFromCookie } from "./middlewares/loadUserFromCookie.js"

export const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(loadUserFromCookie)

// home
app.get("/", auth, async (req, res) => {
  const polls = await getAllPolls()

  res.render("index", {
    title: "Hlasování",
    sender: res.locals.user,
    polls: polls,
  })
})

// Registration and login - move all to user route==================================
app.get("/register", async (req, res) => {
  res.render("register", {
    errorRegister: false,
    errorLogin: false,
  })
})

app.post("/register", async (req, res) => {
  const login = req.body.login1
  const password = req.body.password1

  if (await loginAlreadyUsed(login)) return res.redirect("/register-error")

  const user = await createUser(login, password)
  res.cookie("token", user.token)

  sendPollsToAllConnections(res.locals.user).catch((e) => console.error(e))
  res.redirect("/")
})

app.post("/login", async (req, res) => {
  const login = req.body.login2
  const password = req.body.password2

  const user = await getUser(login, password)

  if (!user) return res.redirect("/register-login-error")

  res.cookie("token", user.token)
  sendPollsToAllConnections(res.locals.user).catch((e) => console.error(e))
  res.redirect("/")
})

app.get("/sign-out", auth, async (req, res) => {
  res.clearCookie("token")
  res.redirect("/register")
})

//Polls - add into new router file =======================================
// New poll 
app.get("/new-poll/:num", auth, async (req, res) => {
  const num = req.params.num
  res.render("new-poll", {
    sender: res.locals.user,
    num: num,
  })
})

// tohle predelat - rozdelit a presunout?
app.post("/add-poll", auth, async (req, res) => {
  const title = req.body.poll_title
  const options = Array.isArray(req.body.option) ? req.body.option : [req.body.option]

  const poll = {
    title: title,
    author_id: res.locals.user.id,
  }

  const [poll_id] = await db("polls").insert(poll, "id")

  for (const opt of options) {
    const option = {
      poll_id: poll_id.id,
      title: opt,
    }
    await db("options").insert(option)
  }

  sendPollsToAllConnections(res.locals.user).catch((e) => console.error(e))
  res.redirect("/")
})

// Voting
app.post("/vote/:id", auth, async (req, res, next) => { // delete next?
  const pollId = req.params.id
  const selectedOptionId = req.body[pollId]
  if (!selectedOptionId) return res.redirect("/")


// tadyto dat do db
  const option = await db("options")
    .select("*")
    .where("id", selectedOptionId)
    .first()
  if (!option) return null // this might be wrong, handle better? but it might be unnecessary

  await db("options")
    .where("id", selectedOptionId)
    .update({ votes_count: parseInt(option.votes_count) + 1 })

  sendPollsToAllConnections(res.locals.user).catch((e) => console.error(e))
  res.redirect("/")
})

// Delete
// taky fce do db
app.get("/delete/:id", auth, async (req, res) => {
  await db("polls").delete().where("id", "=", req.params.id)
  await db("options").delete().where("poll_id", "=", req.params.id)

  sendPollsToAllConnections(res.locals.user).catch((e) => console.error(e))
  res.redirect("/")
})

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
