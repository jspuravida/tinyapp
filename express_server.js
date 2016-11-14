const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');
// Remokved cookieParser in order to switch to sessions.

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set('trust proxy', 1);


// replacing with a master database for userId, email, password, short url, full urls.
// var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// middleware used here if to check if user has a session and lets info be available
app.use((req, res, next) => {
  req.session.userId;
  req.currentUser = users[userId];
  res.locals.email = '';
  if (req.currentUser) {
    res.locals.email = req.currentUser.email;
  }
  next();
});

app.get("/register", (req, res) => {
  res.render("registration");
});

const users = {

  {id: 's4f5j3'
    [id: 's4f5j3',
    email: 'testing@gmail.com',
    password: '$2a$10$/AxxuxDhP04QdabvZ7MAQ.Pqdy6HCdPwrV6TDNNBw2P02OcyTfN7O',
    shortURL: 'b2xVn2',
    fullURL: 'http://www.lighthouselabs.ca/']
  }

  {id: 'l9p4j6'
    [id: 'l9p4j6',
    email: 'testing2@gmail.com',
    password: '$1a$10$/AxxuxDhP04QdabvZ7MAQ.Pqdy6HCdPwrV6TDNNBw2P02OcyTfN7O',
    shortURL: '4k4l5l',
    fullURL: 'http://www.codecore.ca/']
  }
};
// hardcoded new database objects for testing/review purposes.
//
// console.log(users);

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" || password === "" ) {
    res.send("Error: 400");
    return;
  } else {
    var foundEmail = false;
    Object.keys(users).forEach(function(userId) {
      if (users[userId].email == email) {
        foundEmail = true;
      }
    });
    if (foundEmail) {
      res.send("Error: 400");
      return;
    }
  }

  const userRandomID = generateRandomString();
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    const newUser = { id: userRandomID, email: email, password: hash };
    users[userRandomID] = newUser;
    req.session.userId = 'userId';
    console.log(users);
    res.redirect("/");
  });
});

app.post("/login", (req, res) => {
  var email = req.body.loginEmail;
  var password = req.body.password;
  for (var userId in users) {
    if(users[userId].email === email) {
      if(bcrypt.compareSync(password, users[userId].password)) {
        req.session.userId = 'userId';
        res.redirect("/urls");
        return;
      }
    }
  }
  res.status(400).send("Invalid login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let fullURL = req.body.fullURL;
  urlDatabase[shortURL] = fullURL;
  res.redirect(`/urls/${shortURL}`);
});
// Grab the short url and add it to the urlDatabase

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  var list = "abcdefghijklmnopqrstuvwxyz0123456789"; //list of characters to choose from
  var urlShortened = ""; //stores the new url
  for (var i = 0; i < 6; i++) { //loops until it hits the set max length
    urlShortened += list.charAt(Math.floor(Math.random() * list.length)); //randomly outputs a character from the list and stores in urlShortened
  }
  return urlShortened;
}




