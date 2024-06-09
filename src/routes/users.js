import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { createUser, getUser, loginAlreadyUsed } from "../db.js"
import { sendPollsToAllConnections } from "../websockets.js"

export const usersRouter = new Router()

usersRouter.get("/register", async (req, res) => {
  res.render("register", {
    errorRegister: false,
    errorLogin: false,
  })
})

usersRouter.post("/register", async (req, res) => {
  const login = req.body.login1
  const password = req.body.password1

  if (await loginAlreadyUsed(login)) return res.redirect("/register-error")

  const user = await createUser(login, password)
  res.cookie("token", user.token)

  sendPollsToAllConnections().catch((e) => console.error(e))
  res.redirect("/")
})

usersRouter.post("/login", async (req, res) => {
  const login = req.body.login2
  const password = req.body.password2

  const user = await getUser(login, password)

  if (!user) return res.redirect("/register-login-error")

  res.cookie("token", user.token)
  sendPollsToAllConnections().catch((e) => console.error(e))
  res.redirect("/")
})

usersRouter.get("/sign-out", auth, async (req, res) => {
  res.clearCookie("token")
  res.redirect("/register")
})
