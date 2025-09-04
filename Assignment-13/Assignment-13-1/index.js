
const EventEmitter = require("events");


const eventBus = new EventEmitter();


eventBus.on("userLoggedIn", (username) => {
  console.log(`> User ${username} logged in`);
});

eventBus.on("userLoggedIn", (username) => {
  console.log(`> Notification sent to ${username}`);
});


eventBus.on("messageReceived", (username, message) => {
  console.log(`> New message for ${username}: "${message}"`);
});


eventBus.on("dataSynced", (username) => {
  console.log(`> Data sync complete for ${username}`);
});


function simulateApp(username) {

  setTimeout(() => {
    eventBus.emit("userLoggedIn", username);


    setTimeout(() => {
      eventBus.emit("messageReceived", username, "Welcome to the system!");


      console.log("> Syncing user data...");
      setTimeout(() => {
        eventBus.emit("dataSynced", username);
      }, 2000);

    }, 2000);

  }, 1000);
}


simulateApp("John");
