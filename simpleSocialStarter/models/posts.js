let nextPostID = 3;  // because you already have 0, 1, 2

let postData = [
  { postid: 0, message: "hello", user: "user1" },
  { postid: 1, message: "goodbye", user: "user2" },
  { postid: 2, message: "morning", user: "user3" }
];

function getPosts() {
  return postData.slice();
}

function addPost(message, user) {
  let newPost = {
    postid: nextPostID++,
    message: message,
    user: user
  };
  postData.push(newPost);              // ⬅️ same as tutor
}

function getLastNPosts(n = 3) {
  return postData.slice(-n).reverse(); // ⬅️ same as tutor
}

module.exports = {
  getPosts,
  addPost,
  getLastNPosts
};

