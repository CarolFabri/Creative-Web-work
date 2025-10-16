const insideBag ={
bag:"makeup",
book:"notebook",
clothe:"extra shirt",
wallet:{
    money:200,
    card: 3,
},
newBag: function(newOneItem){
    this.bag= newOneItem;
},
updateWallet: function(newMoney, newCard){
    this.wallet.money= newMoney;
    this.wallet.card=newCard;
},
}
console.log("What is inside my bag:",insideBag.bag);
insideBag.newBag("lipstick and Concealer");
console.log("I've changed my bag items what's the new items? ", insideBag.bag);
insideBag.updateWallet(150,4);
console.log("I went shopping and spent some money, so what's the money left on my wallet?", insideBag.wallet.money, "what's my new card ?", insideBag.wallet.card);
