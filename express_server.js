var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var randomstring = require("randomstring");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString(length) {
  return randomstring.generate(length);
};


// Routes

// Root route
app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls", (request, response) => {
  let templateVars = {
    username: request.cookies["username"],
    urls: urlDatabase
  };
  // console.log(templateVars);
  response.render("urls_index", templateVars);
});



// app.get("/urls.json", (request, response) => {
//   response.json(urlDatabase);
// });

//Create new URLS
app.get("/urls/:id", (request, response) => {
  if (request.params.id in urlDatabase) {
    response.render("urls_show", {
      username: request.cookies["username"],
      shortURL: request.params.id,
      url: urlDatabase[request.params.id]
    })
  } else {
    response.render("urls_new", {
      username: request.cookies["username"],
    });
  }
});
app.post("/urls", (request, response) => {
  let shortRandomKey = generateRandomString(6);
  urlDatabase[shortRandomKey] = request['body']['longURL']; // debug statement to see POST parameters
  response.redirect(`/urls/${shortRandomKey}`); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (request, response) => {
  // let longURL = ...
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.post("/urls/:id/delete", (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect("/urls");
});

app.post("/urls/:id/update", (request, response) => {
  urlDatabase[request.params.id] = request['body']['longURL'];
  response.redirect("/urls");
});

app.post("/login", (request, response) => {
  let user = request['body']['usernameInsert'];
  response.cookie('username', user);
  response.redirect("/");
});

app.post("/logout", (request, response) => {
  response.clearCookie('username', {
    path: '/'
  });
  response.redirect("/");
});

app.get("/register", (request, response) => {
  response.render("urls_register");
});

app.post("/register", (request, response) => {
  if (request.body.email === "" || request.body.password === "") {
    response.status(400).send('Email or password needs to be entered.');
    return;
  } else {
    for (let user in users) {
      if (users[user]['email'] === request.body.email) {
        response.status(400).send('One of your fields is incorrect.')
        return;
      }
    }
  }
  let randomIDgen = generateRandomString(6);
  users[randomIDgen] = {
    id: randomIDgen,
    email: request.body.email,
    password: request.body.password
  }
  console.log(users);
  response.cookie('user', users[randomIDgen]['id']);
  response.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});