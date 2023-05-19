const express = require("express");
const cookieParser = require('cookie-parser')
const cookieSession = require("cookie-session");
//const urlsForUser = require("./helpers");
const bcrypt = require("bcryptjs");

const { getUserByEmail, urlsForUser } = require("./helpers");
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
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

/* const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "54hyykn7": "https://www.icicibank.com"
};
 */

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10), // Hashed password using bcrypt
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
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
  const sessionId = req.session["user_id"];
  console.log("sessionId",sessionId);
  console.log("users=", users);
  console.log("urlDatabase = ", urlDatabase);


  if (!sessionId)
    return res.redirect("/register")

  const user = users[sessionId];
  if (!user)
  return res.send("You must login/register first").redirect("/register");
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase), user
   };

  res.render("urls_index", templateVars);
});


// Handler for the "/urls/new" route

app.get("/urls/new", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (!user) {
    // Redirect to the "/login" page if the user is not logged in
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
  };
  // Render the "urls_new" template with the provided template variables
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const sessionId = req.session["user_id"];
  console.log("sessionId = ", sessionId);
 

  if (!sessionId) {
    //return res.redirect("/register");
    return res.status(403).send("Please Login with Registered Email ID.");
  }

  //const user = users[sessionId]; 
  const user = users[req.session["user_id"]];
  console.log("user = ", user);
  if (!user) {
    console.log("Not a Registered User, please register first");
    return res.redirect("/register");
  }


  if (!urlDatabase[req.params.id])
    return res.status(403).send("URL Short ID doesn't exist in Database");

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };

  //todo: If the user doesn't own the URL then display proper message.
  console.log("urlDatabase = ", urlDatabase);
  console.log("urlDatabase[req.params.id].userId = ", urlDatabase[req.params.id].userId);


  console.log("users = ", users);

  res.render("urls_show", templateVars);

});


// Handler for the "/urls" POST route


app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userId: req.session.user_id
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("Please Login...<h3><a href= '/Login'> login </a></h3>");
  }
});

app.get("/u/:id", (req, res) => {
  // Get the longURL associated with the ID
  const myUrl = urlDatabase[req.params.id].longURL;
  if (!myUrl) {
    return res.send("URL not found");
  } else {
    res.redirect(myUrl);
  }
});

//// POST (delete url):

app.post("/urls/:id/delete", (req, res) => {
 
  if (!urlDatabase[req.params.id]) {
    // Send a message if the specified URL doesn't exist in the database
    return res.send("URL doesn't exist");
  }
  const userId = req.session["user_id"]; // Get the user_id from the session
  const user = users[userId]; // Get the user object based on the user_id
  console.log("user = ", user);
  console.log("userId = ", userId);

  if (!user) {
    // Send a message if the user is not logged in
    return res.status(403).send("You must login/register first");
  }
  console.log("req.params.id = ",req.params.id); 
  console.log("req.session[user_id] = ",req.session["user_id"] );
  console.log("urlDatabase[req.params.id].userId = ",urlDatabase[req.params.id].userId );
  
  if (user.id !== userId) {
    // Send a message if the user is not own the url to delete 
    return res.send("Logged in User Not authorized to delete this URL id", req.params.id);
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");

});

// POST (edit url): updates longURL if url belongs to user
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    const sessionId = req.session.user_id;
    const id = req.params.id;
    if (sessionId  && sessionId === urlDatabase[id].userId) {
      urlDatabase[id].longURL = req.body.newURL;
      res.redirect(`/urls`);
    } else {
      res.status(401).send("You do not have authorization to edit...<h3><a href= '/Login'> login </a></h3>");
    }
  } else {
    res.redirect('/login');
  }
});

//POST (Login)

app.post("/login", (req, res) => {
  // Get the email and password from the request body
  const { email, password } = req.body;
  // Find the user based on the email
  const user = getUserByEmail(email, users);
  if (!user) {
    // Send a message if the email is not found
    return res.status(403).send("Email not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    // Send a message if the password is incorrect
    return res.status(403).send("Incorrect password");
  }
  req.session.user_id = user.id; // Store the user_id in the session
  res.redirect("/urls"); // Redirect to the "/urls" page after successful login
});


// Handler logout
app.post("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/login"); // Redirect to the "/login" page after logout
});


// register route GET
app.get("/register", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (user) {
    // Redirect to the "/urls" page if the user is already logged in
    return res.redirect("urls");
  }
  const templateVars = {
    user: null,
  };
  // Render the "register" template with the provided template variables
  res.render("register", templateVars);
});


// Registration Handler
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).send("Please enter valid email or password");
  }
  console.log(getUserByEmail(email, users));
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exist");
  }
  const id = generateRandomString(email.length);
  users[id] = {
    id,
    email: email,
    password: bcrypt.hashSync(password, 10), // Hash the password before storing
  };
  //console.log("users = ", users);
  //console.log("urlDatabase =", urlDatabase);
  req.session.user_id = id;
  res.redirect("/urls");
});

//GET Login
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
