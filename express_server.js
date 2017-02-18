var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var randomstring = require("randomstring");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

//res.locals.user_ID = req.cookies['user_ID'];

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'development'],
}))

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    id: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user3RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "test@test.com",
    password: bcrypt.hashSync("test123", 10)
  }
};

function generateRandomString(length) {
  return randomstring.generate(length);
};

function findUser(email) {
  for (user in users) {
    if (users[user]['email'] === email) {
      return users[user]['id'];
    }
  }
}

function returnUserObject(email) {
  for (user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
}

function urlsForUser(id) {
  let userURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLs[urlDatabase[url].id] = {
        id: urlDatabase[url].id,
        longURL: urlDatabase[url].longURL
      }
    }
  }
  return userURLs;
}

// Routes

// Root route
app.get("/", (request, response) => {
  response.redirect("/urls");
});

app.get('/urls', (request, response) => {
  if (request.session.user_ID === undefined) {
    response.status(401).send('Please Login to continue or Register. <p><a href="/login">Login</a></p> <p><a href="/register">Register</a></p>');
  } else {
    for (let user in users) {
      if (request.session.user_ID === users[user]['id']) {
        response.status(200);
        response.render('urls_index', {
          urls: urlsForUser(request.session.user_ID),
          user_ID: request.session.user_ID,
          user_email: users[user]['email']
        });
        return;
      }
    }
  }
});


app.get('/urls/new', (request, response) => {
  if (request.session.user_ID === undefined) {
    response.status(401).send('Please Login to continue or Register. <p><a href="/login">Login</a></p> <p><a href="/register">Register</a></p>');
  } else {
    for (let user in users) {
      if (request.session.user_ID === users[user]['id']) {
        response.status(200).render('urls_new', {
          user_ID: request.session.user_ID,
          user_email: users[user]['email']
        });
        return;
      }
    }
  }
});

// TODO if user is not logged in:
// returns a 401 response, HTML with a relevant error message and a link to /login
// TODO if logged in user does not match the user that owns this url:
// returns a 403 response, HTML with a relevant error message
app.get("/urls/:id", (request, response) => {
  if (urlDatabase[request.params.id] === undefined) {
    response.status(404).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else if (request.session.user_ID === undefined) {
    response.status(401).send('401 Error. <p><a href="/login">Login</a></p>');
  } else if (request.session.user_ID !== urlDatabase[request.params.id].userID) {
    response.status(403).send('403 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else(request.session.user_ID === urlDatabase[request.params.id].userID)
  response.status(200).render("urls_show", {
    user_ID: request.session.user_ID,
    shortURL: urlDatabase[request.params.id].id,
    longURL: urlDatabase[request.params.id].longURL,
    urlUserID: urlDatabase[request.params.id].userID,
    user_email: users[`${request.session.user_ID}`].email
  });

});

app.get("/u/:id", (request, response) => {
  if (request.params.id in urlDatabase) {
    let longURL = urlDatabase[request.params.id].longURL;
    response.status(200).redirect(longURL);
  } else {
    response.status(404).send('Page does not exist. <p><a href="/urls">Back to TinyApp</a></p>');
  }
});

app.post("/urls", (request, response) => {
  if (request.session['user_ID']) {
    let shortRandomKey = generateRandomString(6);
    urlDatabase[shortRandomKey] = {
      id: shortRandomKey,
      longURL: request['body']['longURL'],
      userID: request.session.user_ID
    }
    console.log(urlDatabase[shortRandomKey]);
    response.redirect(`/urls/${shortRandomKey}`);
  } else {
    response.status(401).send('401 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  }
});



app.post("/urls/:id/delete", (request, response) => {
  if (urlDatabase[request.params.id] === undefined) {
    response.status(404).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>')
  } else if (!request.session) {
    response.status(401).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else if (request.session.user_ID !== urlDatabase[request.params.id].userID) {
    response.status(403).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else {
    delete urlDatabase[request.params.id];
    response.redirect("/urls");
  }
});

app.post("/urls/:id/update", (request, response) => {
  if (urlDatabase[request.params.id] === undefined) {
    response.status(404).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>')
  } else if (!request.session) {
    response.status(401).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else if (request.session.user_ID !== urlDatabase[request.params.id].userID) {
    response.status(403).send('404 Error. <p><a href="/urls">Back to TinyApp</a></p>');
  } else {
    urlDatabase[request.params.id].longURL = request['body']['longURL'];
    response.redirect("/urls");
  }
});



app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/");
});

app.get("/login", (request, response) => {
  if (request.session.user_ID) {
    response.redirect('/');
  } else {
    response.render("urls_login");
  }
});

app.post("/login", (request, response) => {
  let userEmail = request['body']['email'];
  let userPassword = request['body']['password'];
  for (let user_ID in users) {
    let findUserID = findUser(userEmail);
    if (userEmail === users[user_ID]['email']) {
      if (bcrypt.compareSync(userPassword, users[user].password)) {
        request.session.user_ID = findUserID;
        response.redirect("/");
        return;
      } else {
        response.status(401).send('One of your fields is incorrect. <p><a href="/login">Back to Login</a></p>');
        return;
      }
    }
  }
  response.status(400).send('One of your fields is incorrect. <p><a href="/login">Back to Login</a></p>');
});

app.get("/register", (request, response) => {
  if (request.session.user_ID) {
    response.redirect('/');
  } else {
    response.status(200).render("urls_register");
  }
});

app.post("/register", (request, response) => {
  if (request.body.email === "" || request.body.password === "") {
    response.status(400).send('Email or password needs to be entered. <p><a href="/register">Back to Register</a></p>');
    return;
  } else {
    for (let user_ID in users) {
      if (users[user_ID]['email'] === request.body.email) {
        response.status(400).send('One of your fields is incorrect. <p><a href="/register">Back to Register</a></p>')
        return;
      }
    }
  }
  let randomIDgen = generateRandomString(6);
  users[randomIDgen] = {
    id: randomIDgen,
    email: request.body.email,
    password: bcrypt.hashSync(request.body.password, 10)
  }
  console.log(users);
  request.session.user_ID = randomIDgen;
  response.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});