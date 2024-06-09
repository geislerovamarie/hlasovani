import { getUserByToken } from "../db.js"

export const loadUserFromCookie = async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    res.locals.user = await getUserByToken(token)
  } else {
    res.locals.user = null
  }
  next()
}
