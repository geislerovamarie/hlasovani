import { Router } from "express";
import { addVote, deletePoll, insertPoll } from "../db.js";
import { sendPollsToAllConnections } from "../websockets.js";
import { auth } from "../middlewares/auth.js";

export const pollsRouter = new Router();

// render new poll view
pollsRouter.get("/new-poll/:num", auth, async (req, res) => {
  const num = req.params.num;
  res.render("new-poll", {
    sender: res.locals.user,
    num: num,
  });
});

// add new poll into db
pollsRouter.post("/add-poll", auth, async (req, res) => {
  const title = req.body.poll_title;
  const options = Array.isArray(req.body.option)
    ? req.body.option
    : [req.body.option];

  await insertPoll(title, res.locals.user.id, options);

  sendPollsToAllConnections().catch((e) => console.error(e));
  res.redirect("/");
});

pollsRouter.post("/vote/:id", auth, async (req, res, next) => {
  const pollId = req.params.id;
  const selectedOptionId = req.body[pollId];
  if (!selectedOptionId) return res.redirect("/");

  await addVote(selectedOptionId);

  sendPollsToAllConnections().catch((e) => console.error(e));
  res.redirect("/");
});

pollsRouter.get("/delete/:id", auth, async (req, res) => {
  await deletePoll(req.params.id);

  sendPollsToAllConnections().catch((e) => console.error(e));
  res.redirect("/");
});
