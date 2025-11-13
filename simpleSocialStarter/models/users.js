let users = [
  {
    username: "user1",
    password: "123"
  },
  {
    username: "user2",
    password: "456"
  }
];

function addUser(username, password) {
  let existingUser = findUser(username);
  if (!existingUser) {
    let newUser = {
      username: username,
      password: password
    };
    users.push(newUser);
    return true;
  }
  return false;
}

function checkUser(username, password) {
  let foundUser = findUser(username);
  if (foundUser) {
    return foundUser.password == password;
  } else {
    return false;
  }
}

function findUser(username) {
  return users.find(thisUser => thisUser.username == username);
}

module.exports = {
  addUser,
  checkUser,
  findUser
};