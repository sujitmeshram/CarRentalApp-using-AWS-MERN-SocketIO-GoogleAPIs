$(document).ready(function () {
  var socket = io();

  //   connect client to server
  socket.on("connect", function (socket) {
    console.log("Connected to server");
  });

  //disconnnect from server
  socket.on("disconnect", function (socket) {
    console.log("Disconnected from server");
  });
});
