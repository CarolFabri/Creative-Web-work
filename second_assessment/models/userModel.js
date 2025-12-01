const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  firstname: String,
  lastname:String,
  isAdmin: Boolean
})

const userData = model('users', userSchema)

async function addUser(usernameFromForm, password, firstnameFromForm, lastnameFromForm) {
  // let found = userData.find(thisUser => thisUser.username == usernmae);
  let found = null;
  found = await userData.findOne({ username: usernameFromForm})
  if (found) {
    return false;
  } else {
    let newUser = {
      username: usernameFromForm,
      password: password,
      firstname:firstnameFromForm,
      lastname:lastnameFromForm
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

async function findUser(username) {
  return userData.findOne({username: username})
}
async function updateProfile(username, firstname, lastname) {
  return userData.updateOne(
    { username: username },
    { $set: { firstname: firstname, lastname: lastname } }
    
  ); 
} 

async function findUserbyUsername(username){
  return userData.findOne({username:username})
}

async function getAllUsersWithoutPasswords() {
  return userData.find({}, {password: 0}) // exclude password field, admin won't see passwords 
}
async function deleteUserById(id) {
  return userData.deleteOne({ _id: id });
}


module.exports = {
  addUser,
  checkUser,
  findUser,
  updateProfile,
  findUserbyUsername,
  getAllUsersWithoutPasswords,
  deleteUserById
};