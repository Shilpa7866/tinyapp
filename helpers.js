function getUserByEmail(email, users) {
  for (const userId in users) {
    console.log(users);
    if (users[userId].email === email) {
      console.log("helper function");
      return users[userId];
    }
  }
  
  return null;
}


function urlsForUser(id, urlDatabase) {
  const filteredURL = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      filteredURL[urlId] = urlDatabase[urlId];
    }
  }
  return filteredURL;
}

module.exports = { getUserByEmail, urlsForUser }; 

