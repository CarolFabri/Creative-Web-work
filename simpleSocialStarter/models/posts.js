let postData=[
    {
        postid: 0,
        message:"Hi it's Dave",
        user:"Dave"
    },{
        postid: 1,
        message:"Glad it's Thursday",
        user:"Julie"
    }
]

function getPosts(){
    return postData.slice()
}

function addPost(message, user){
    let newPost={
        postid: nextPostID++,
        message: message,
        user: user
    }
    postData.push(newPost)
}

module.exports={
    getPosts,
    addPost
}