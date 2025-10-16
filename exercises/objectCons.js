function livingRoom(sofa, table, chair, lamp, tv){
    this.sofa = sofa;
    this.table = table;
    this.chair = chair;
    this.lamp = lamp;
    this.tv = tv;
}
const rebuilding = new livingRoom("Green Sofa", "Wooden Table", "Four Dining Chairs", "Floor Lamp", "Smart TV");
console.log(rebuilding);

const newStyle = new livingRoom("Cotton Sofa", "Black Table", "Four metal Chairs", "Balcony Lamp", "3D TV");
console.log(newStyle);