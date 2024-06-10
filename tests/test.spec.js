import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import { db, createUser, getUser } from "../src/db.js"

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("1) createUser succesfully creates a new user", async (t) => {
  const user = await createUser("testUser", "12345")
  t.not(user.hash, "12345")
})

test.serial("2) getUser succesfully returns user", async (t) => {
  const user1 = await createUser("testUser1", "12345")
  t.deepEqual(await getUser("testUser1", "12345"), user1)

  t.is(await getUser("testUser2", "12345"), null)

  const user3 = await createUser("testUser3", "password")
  t.notDeepEqual(await getUser("testUser3", "12345"), user3)

  const user4 = await createUser("testUser4", "lasdojflj#%56a")
  t.deepEqual(await getUser("testUser4", "lasdojflj#%56a"), user4)
})

test.serial(
  "3) Unauthorized user gets registration and login screen",
  async (t) => {
    const response = await supertest.agent(app).get("/").redirects(1)

    t.assert(response.text.includes("Hlasování"))
    t.assert(response.text.includes("Registrace"))
  },
)

test.serial("4) Logged user sees the home page", async (t) => {
  const response = await supertest
    .agent(app)
    .post("/register")
    .type("form")
    .send({ login1: "testUser", password1: "12345" })
    .redirects(1)

  t.assert(response.text.includes("Hlasování"))
  t.assert(response.text.includes("testUser"))
  t.assert(response.text.includes("Odhlásit"))
})
