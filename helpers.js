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

function generateRandomString(len) {
  let generatedNumber = Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
  return generatedNumber;
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

module.exports = { getUserByEmail, urlsForUser, generateRandomString }; 

