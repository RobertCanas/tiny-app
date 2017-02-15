var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

app.get("/", (require, response) => {
  response.end("Hello!");
});

app.get("/urls", (require, response) => {
  let templateVars = {
    urls: urlDatabase
  };
  // console.log(templateVars);
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (require, response) => {
  response.render("urls_new");
});

app.post("/urls", (require, response) => {
  console.log(req.body); // debug statement to see POST parameters
  response.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
});

app.get("/urls/:id", (require, response) => {
  let templateVars = {
    shortURL: require.params.id,
    url: urlDatabase[require.params.id]
  };
  response.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});