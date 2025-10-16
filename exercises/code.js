console.log("running");


let students = [];

let myForm = document.getElementById("myForm"); // match with form id in HTML
myForm.addEventListener("submit", submitted);

let locationGeo = document.getElementById("demo", getLocation);


function submitted(event) {
    event.preventDefault();
    console.log("form submitted");

    console.log("First name:", event.target.firstName.value);
    console.log("Last name:", event.target.lastName.value);
    console.log("Lives in:", event.target.livesin.value);

    let newStudent = {
        name: event.target.firstName.value,
        livesin: event.target.livesin.value
    };

    students.push(newStudent);

    console.log(students);                  // as array of objects
    console.log(JSON.stringify(students));  // as JSON string
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function success(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "Longitude:" + position.coords.longitude;
}

function error() {
  alert("Sorry, no position available.");
}


   