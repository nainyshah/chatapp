const users = [];
// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  // clearn the data
  userName = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!userName || !room) {
    return {
      error: "Username and room are required!",
    };
  }
  // Check for existing user.
  const existingUser = users.find((user) => {
    return (
      user.username.toLowerCase() === userName &&
      user.room.toLowerCase() === room
    );
  });

  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //   Store user
  const user = { id, username, room };
  users.push(user);
  console.log(users);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => {
    if (user.id === id) {
      return user;
    }
  });
};

const getUsersInRoom = (roomname) => {
  return users.filter(
    (user) => user.room.toLowerCase() === roomname.toLowerCase()
  );
};

// addUser({
//   id: 22,
//   username: "Syed Raza",
//   room: "Amex",
// });
// addUser({
//   id: 23,
//   username: "Noraiz Raza",
//   room: "Amex",
// });
// addUser({
//   id: 24,
//   username: "Ali Taqi",
//   room: "Amexs",
// });

// // console.log(users);
// // const user = getUser(24);
// const userss = getUsersInRoom("Amex");
// // // const removedUser = removeUser(22);
// console.log(userss);

module.exports = {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
};
