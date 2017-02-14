var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (require, response) => {
  response.end("Hello!");
});

app.get("/urls", (require,response) => {
  let templateVars = { urls: urlDatabase };
  // console.log(templateVars);
  response.render("urls_index", templateVars);
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
});

app.get("/urls/:id", (require, response) => {
  let templateVars = { shortURL: require.params.id,
                       url : urlDatabase[require.params.id] };
  console.log(templateVars);
  response.render("urls_show", templateVars);
});

app.get("/hello", (require, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});