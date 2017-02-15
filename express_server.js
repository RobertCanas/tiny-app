var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var randomstring = require("randomstring");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(length) {
  return randomstring.generate(length);
};

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

// app.get("/urls/new", (require, response) => {
//   response.render("urls_new");
// });

app.post("/urls", (require, response) => {
  let shortRandomKey = generateRandomString(6);
  urlDatabase[shortRandomKey] = require['body']['longURL']; // debug statement to see POST parameters
  response.redirect(`/urls/${shortRandomKey}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (require, response) => {
  // let longURL = ...
  let longURL = urlDatabase[require.params.shortURL];
  response.redirect(longURL);
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
});

app.get("/urls/:id", (require, response) => {
      if (require.params.id in urlDatabase) {
        response.render("urls_show", {
          shortURL: require.params.id,
          url: urlDatabase[require.params.id]
        })} else {
        response.render("urls_new");
      }
    });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});