const socket = io();
// Elements
const chatForm = document.querySelector("form");
const message = document.querySelector("input");
const sendLocationBtn = document.querySelector("#send-location");

const $messsage = document.querySelector("#messages");
const sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
// . Goal: Create a separate event for location sharing messages.

// .1. Have server emit location message with URL.
// .2. Have the client listen to the "locationMessage" and print the URL to the console.
// .4. Test your Work by sharing a location.

// . Goal: Render new template for location messages.

// .1. Duplicate the message template.
//    - change the Id to something else.
// .2. Add a link inside the paragraph with the link text "My Current Location!"
//    - URL for the link should be the maps URL(dynamic)
// .3 Select the template from javascript
// .4 Render the template with the URL and append to message.
// .4. Test your Work :)

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // console.log("autoScroll");
  // New Message Element
  const $newMessage = $messsage.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);

  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messsage.offsetHeight;
  // console.log(visibleHeight);
  // Height of message Container
  const containerHeight = $messsage.scrollHeight;
  //How far Have I scrolled
  const scrollOffset = $messsage.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messsage.scrollTop = $messsage.scrollHeight;
  }
};

socket.on("locationMessage", (url) => {
  console.log(url);
  const locationHtml = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format("h:mm:ss a"),
  });
  $messsage.insertAdjacentHTML("beforeend", locationHtml);
  autoScroll();
});

socket.on("message", (message) => {
  console.log(message);
  // const message = message.text;
  const msg =
    message.createdAt == undefined
      ? ""
      : moment(message.createdAt).format("h:mm:ss a");

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: msg,
  });
  $messsage.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("userData", ({ room, users }) => {
  const sidebarHtml = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  // $sidebar.insertAdjacentHTML("beforeend", "");
  sidebar.innerHTML = sidebarHtml;
});
const sendMessage = (msg) => {
  socket.emit("sendMsg", msg, (error) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("Message Delievered!");
    }
  });
};
// . Goal: Setup Acknowledgement
// .1. Setup the client acknowledge function
// .2. Setup the server to sendback the acknowledgement
// .3. Have the client print "Location Shared!" when acknowledged.
// .4. Test your Work.

const sendLocation = (location) => {
  socket.emit("sendLocation", location, (error) => {
    if (!error) {
      console.log("Location Shared!");
    }
  });
};
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(message.value);
  message.value = "";
  message.focus();
});
// . Goal : Share Coordinates with other users.
// . 1. Have client emit "sendlocation" with an object as the data.
// .    - Object should contains latitude and langitude properties.
// . 2. Server should listen for "sendLocation".
// .    -When fired, send a "message" to all connected clients "Location: lat, long"
// . 3. Test your work.

sendLocationBtn.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position.coords);
    const currentPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    sendLocation(currentPosition);
  });
});

socket.emit(
  "join",
  {
    username,
    room,
  },
  (error) => {
    // console.log("------");
    if (error) {
      alert(error);
      location.href = "/";
    }
  }
);
