//let nextPostID = 3;  // because you already have 0, 1, 2

//let postData = [
// { postid: 0, message: "hello", user: "user1" },
// { postid: 1, message: "goodbye", user: "user2" },
// { postid: 2, message: "morning", user: "user3" }
//];

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const postSchema = new Schema({
  user: String,
  message: String,
  likes: Number,
  time: Date
})

const postData = model('posts', postSchema)


function getPosts() {
  return postData.slice();
}

function addPost(message, user) {
  let newPost = {
    //postid: nextPostID++,
    message: message,
    user: user,
    likes: 0,
    time: Date.now()
  };
  // postData.push(newPost);
  postData.create(newPost)
    .catch(err => {
      console.log("Error:", err)
    })
}

async function getLastNPosts(n = 3) {
  //postData.slice(-n).reverse();
  let foundPosts = []
  foundPosts = await postData.find({}).sort({ 'time': -1 }).limit(n).exec()
  return foundPosts
}


module.exports = {
  getPosts,
  addPost,
  getLastNPosts
};

