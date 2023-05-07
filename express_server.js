const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() { }

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "54hyykn7": "https://www.icicibank.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});
// adding GET route to show the form.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  let longURL = "null";
  console.log("user entered /u/:id:  " + req.params.id);
  longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//// POST (delete url):

app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect('/urls');

});

// POST (edit url);

app.post("/urls/:id/delete", (req, res) => {
  urlDatabase[id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

//POST (Login)
app.post("/login", (req, res) => {
  //req.session = null;
  console.log(req.body);
  res.cookie("username", req.body.username);
     
  console.log(res.cookie);
  res.redirect('/urls');
});

// POST (log out page): clears cookies, session and redirects to urls index page
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});