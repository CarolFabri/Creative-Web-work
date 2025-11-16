//let users = [
// {
// username: "user1",
// password: "123"
// },
// {
//   username: "user2",
//   password: "456"
// }
//];
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String
})

const userData = model('users', userSchema)

async function addUser(usernameFromForm, password) {
  // let found = userData.find(thisUser => thisUser.username == usernmae);
  let found = null;
  found = await userData.findOne({ username: usernameFromForm })
  if (found) {
    return false;
  } else {
    let newUser = {
      username: usernameFromForm,
      password: password
    }
    await userData.create(newUser);
    return true;
  }
  //userData.push(newUser);
}


async function checkUser(usernameFromForm, password) {
  //let foundUser = findUser(username);
  let found = null;
  found = await userData.findOne({ username: usernameFromForm })
  if (found) {
    return found.password == password;
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