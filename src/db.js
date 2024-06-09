import crypto from "crypto"
import knex from "knex"
import knexfile from "../knexfile.js"

export const db = knex(knexfile)

export const createUser = async (login, password) => {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex")
  const token = crypto.randomBytes(16).toString("hex")

  const [user] = await db("users")
    .insert({ login, hash, salt, token })
    .returning("*")

  return user
}

export const getUser = async (login, password) => {
  const user = await db("users").select("*").where("login", login).first()
  if (!user) return null

  const salt = user.salt
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex")
  if (hash !== user.hash) return null

  return user
}

export const loginAlreadyUsed = async (login) => {
  const user = await db("users").where({ login }).first()
  if (!user) return false
  return true
}

export const getUserByToken = async (token) => {
  const user = await db("users").where({ token }).first()
  return user
}

export const insertPoll = async (title, userId, options) => {
  const poll = {
    title: title,
    author_id: userId,
  }

  const [poll_id] = await db("polls").insert(poll, "id")

  //console.log("src/db.js [insert poll] options berofre for cycle:")
  //console.log(options)

  for (const opt of options) {
    if(!opt) continue;

    const option = {
      poll_id: poll_id.id,
      title: opt,
    }
    await db("options").insert(option)
    //console.log(option)
  }

  
}

export const getAllPolls = async () => {
  var polls = []
  const pollsWithoutOptions = await db("polls").select("*")

  for (const p of pollsWithoutOptions) {
    const options = await db("options").select("*").where("poll_id", p.id)
    p.options = options

    let help = await db("users")
      .select("login")
      .where("id", p.author_id)
      .first()

    p.author = help.login
    polls.push(p)
  }

  console.log("src/db.js getAllPolls")
  console.log(polls)
  for(let i=0; i < polls.length; i++) console.log(polls[i].options)
  return polls
}

export const addVote = async (selectedOptionId) => {
  const option = await db("options")
    .select("*")
    .where("id", selectedOptionId)
    .first()
  //if (!option) return null // this might be wrong, handle better? but it might be unnecessary

  await db("options")
    .where("id", selectedOptionId)
    .update({ votes_count: parseInt(option.votes_count) + 1 })

}

export const deletePoll = async (id) => {
  await db("polls").delete().where("id", "=", id)
  await db("options").delete().where("poll_id", "=", id)
}