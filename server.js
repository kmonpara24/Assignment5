/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ______________________ Student ID: ______________ Date: ______________
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/

const legoSets = require("./modules/legoSets");
const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get("/lego/sets", async (req, res) => {
  const themeQuery = req.query.theme;
  if (themeQuery) {
    const setsByTheme = await legoSets.getSetsByTheme(themeQuery);
    if (setsByTheme) {
      res.render("sets", { sets: setsByTheme });
    } else {
      res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
    }
  } else {
    const allSets = await legoSets.getAllSets();
    res.render("sets", { sets: allSets });
  }
});

app.get("/lego/sets/:id", async (req, res) => {
  try {
    const setNum = req.params.id;
    const set = await legoSets.getSetByNum(setNum);
    res.render("set", { set });
  } catch (err) {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
  }
});

app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoSets.getAllThemes();
    res.render('addSet', { themes: themes });
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.post('/lego/addSet', (req, res) => {
  const setData = req.body;

  legoSets.addSet(setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/editSet/:num', async (req, res) => {
  const setNum = req.params.num;

  try {
    const [set, themes] = await Promise.all([legoSets.getSetByNum(setNum), legoSets.getAllThemes()]);
    res.render('editSet', { set, themes });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

app.post('/lego/editSet', (req, res) => {
  const setNumber = req.body.set_num;
  const setData = req.body;

  legoSets.editSet(setNumber, setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.get('/lego/deleteSet/:num', (req, res) => {
  const setNumber = req.params.num;

  legoSets.deleteSet(setNumber)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });
});

app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

legoSets.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on: ${PORT}`);
  });
});
