const express       = require("express");
const bodyParser    = require("body-parser");
const session       = require('express-session');
const bcrypt        = require('bcrypt');
const cookieParser  = require('cookie-parser');
const app           = express();
const PORT          = process.env.PORT || 8080; // default port 8080
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set('trust proxy', 1);

app.use(cookieSession({
  name:'session',
  keys: ['lighthouse', 'lighthouse1'],
}))


var urlDatabase = {
  "b2xVn2": {
    email: "tom@hotmail.com",
    full: "www.lighthouselabs.ca"
  },

  "9sm5xK": {
    email: "tom@hotmail.com",
    full: "www.nhl.com"
  }
};

var users = {
  "Tom": {
    email: "tom@hotmail.com",
    password: "test"}
};


// middleware used here if to check if user has a session and lets info be available
app.use((req, res, next) => {
  let userId = req.cookies['userId'];
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
  // bcrypt.hash(password, saltRounds, function(err, hash) {
    const newUser = { id: userRandomID, email: email, password: password }; // put back 'hash' value replacing 'password'
    users[userRandomID] = newUser;
    res.cookie("userId", userRandomID);
    res.redirect("/urls");
  });
// });

app.post("/login", (req, res) => {
var emailMatch;
var passwordMatch;
var userUniq;

var email = req.body.loginEmail;
var password = req.body.password;

  for (var userId in users) {
    if(users[userId].email === email) {
      emailMatch = users[userId].email;
      passwordMatch = users[userId].password;
      userUniq = userId;

      // if(bcrypt.compareSync(password, users[userId].password)) {
      //   res.cookie('userId', userId);
      //   res.redirect("urls_index");
      //   return;
      // }

    }
    if(password === passwordMatch) {
      req.session.userSessId = userUniq;
      req.session.email = req.body.loginEmail;
      res.redirect('/urls');
      console.log("Req session email", req.session.email);
      return;
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
    email: req.session.email,
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
  var email = req.session.email;
  let shortURL = generateRandomString();
  let fullURL = req.body.fullURL;
  console.log("urls FULL", fullURL);
  urlDatabase[shortURL] = {
    email: email,
    full: fullURL
  };
  console.log(urlDatabase);
  res.redirect('/urls');


});

// Grab the short url and add it to the urlDatabase

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    email: req.session["email"],
    urls: urlDatabase,
    paramId: req.params.id,
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