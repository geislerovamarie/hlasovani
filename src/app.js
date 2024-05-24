import express from "express"

export const app = express();

app.set("view engine", "ejs")

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('index', {
      title: 'Hlasování',
    })
  })
  

