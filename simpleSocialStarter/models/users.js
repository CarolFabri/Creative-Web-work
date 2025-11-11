let userData=[
    {
        username: "user1",
        password: "123"
    },{
        username: "user2",
        password: "456"
    }
]

function addUser(username, password){
    let found=userData.find(thisUser=>thisUser.username==username)
    if(found){
        return false
    } else {
        let newUser={
            username:username,
            password:password
        }
        userData.push(newUser)
        return true
    }
}

function checkUser(username, password){
    let found=userData.find(thisUser=>thisUser.username==username)
    if(found){
        return found.password==password
    } else {
        return false
    }
    //return boolean true if it matches else false
}

module.exports={
    addUser,
    checkUser
}