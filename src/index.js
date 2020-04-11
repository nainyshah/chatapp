const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// app.get("/", function (req, res) {
//   res.send("Hello World");
// });

// Challenge # 2
// 1. Send a welcome message to New User!
//     Send 'Welcome' as the event Data
// 2. Have client listen to message event and print the message to console.
// 3. Test your work!

// . Goal : Allow clients to send messages
// .1. Create a form with a input and button
// .      - Similar to the weather form.
// .2. Setup event listener for form submissions.
// .      - Emit "sendMessage" with input string as message data.
// .3. Have Server listen for "sendMessage"
// .      - send message to all connected clients
// .4. Test your work.

io.on("connection", (socket) => {
  console.log("New socket connection.");
  const welcomeMsg = " Welcome on board ";
  const newUserMsg = " has joined";
  const leavingMsg = " has left!";

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // socket.emit ==> send message to specific client
    // io.emit ==> send message to every connected client
    // socket.broadcast.emit ==> send message to all users except sender
    socket.emit(
      "message",
      generateMessage("Admin", user.username + welcomeMsg)
    );
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", user.username + newUserMsg));
    io.to(user.room).emit("userData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    // io.to.emit ==> send message to everyone in specific room.
    // socket.broadcast.to.emit ==> send messages to everyone in specific room except sender.

    callback();
  });

  //callback parameter is used to handle event acknowledgment.
  socket.on("sendMsg", (msg, callback) => {
    // before broadcasting any message server should need to check bad words
    // if there is a bad word, server will not broadcast, instead acknowledge client to avoid bad words.
    const filter = new Filter();
    const user = getUser(socket.id);
    console.log("send message: " + user);
    if (user) {
      if (filter.isProfane(msg)) {
        return callback("Bad words are not allowed!");
      }
      io.to(user.room).emit("message", generateMessage(user.username, msg));
      callback();
    }
  });

  socket.on("sendLocation", (location, callback) => {
    // const currLocationMessage = { Location: location };
    const currLocationMessage =
      "http://google.com/maps?q=" +
      location.latitude +
      "," +
      location.longitude;
    const user = getUser(socket.id);
    // const locationLink = "<a href='" + currLocationMessage + "'> Find Me! </a>";
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, currLocationMessage)
    );
    callback();
  });

  // Send message on disconnection
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(user);
      console.log(user.room);
      io.to(user.room).emit(
        "message",
        generateMessage(user.username + leavingMsg)
      );
      io.to(user.room).emit("userData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("[Chat-App] => Server is up on port", port);
});
