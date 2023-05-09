const getUserByEmail = function (email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

module.exports = getUserByEmail; 