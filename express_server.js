const express = require("express");
const cookieParser = require('cookie-parser')
const cookieSession = require("cookie-session"); 

const getUserByEmail= require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString(len) {
  let generatedNumber = Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
  return generatedNumber; 
 }

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "54hyykn7": "https://www.icicibank.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  // const sessionId = req.session["user_id"];
  const sessionId = req.session["user_id"]; 
  console.log(sessionId);
  if(!sessionId) return res.redirect("/register")
  const user = users[sessionId];
  if(!user) return res.redirect("/register");
  const templateVars = { urls: urlDatabase, user};
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
  // console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  let longURL = "null";
  // console.log("user entered /u/:id:  " + req.params.id);
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
  req.session["user_id"] = null;
  // res.clearCookie("username");
  res.redirect("/urls");
});

//register form
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[res.cookie.user_id]
  };
  res.render("register", templateVars);
});

// Registration Handler
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).send("Please enter valid email or password");
  } 
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exist");
  } 
  const id = generateRandomString(email.length);
  users[id] = {
    id,
    email: email,
    password: password
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    // Redirect to the "/urls" page if the user is already logged in
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  // Render the "login" template with the provided template variables
  res.render("login", templateVars);
});
