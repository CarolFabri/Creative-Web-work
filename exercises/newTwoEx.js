const felipeLife = {
    study: false,
    work: "intermidiate",
    moneyperWeek:"600",
    careerDev:"sub",
    updatecareerDec: function(newSalary, newJob, newFunction){
        this.moneyperWeek=newSalary;
        this.careerDev=newJob;
        this.work=newFunction;  
    },
}
console.log("Currently Felipe's situation isn't the best", felipeLife);
console.log("Now let's see the new changes that Felipe made in his life");
felipeLife.updatecareerDec("1000","programmer","senior");
console.log("Felipe's new salary is: ", felipeLife.moneyperWeek,"we also made amendments to his job:", felipeLife.careerDev, "and his neew intermediate level is:",felipeLife.work);