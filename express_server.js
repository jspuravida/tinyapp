const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set('trust proxy', 1);

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/register", (req, res) => {
  res.render("registration");
});

const users = {

 "2322323": {id: "l3l3l3", email: "tom@hotmail.com", password: "beoeoeoe"},
 "666653": {id: "23232", email: "ted@hotmail.com", password: "beoeoeoe"},

};

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" || password === "" ) {
    res.send("Error: 400");
    return;
  } else {
    var foundEmail = false;
    Object.keys(users).forEach(function(key) {
      if (users[key].email == email) {
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
    res.cookie("key", userRandomID);
    console.log(users);
    res.redirect("/");
  });
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.cookie('username', '');
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.end("Hello!");
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


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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




