const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const socketIO = require("socket.io");
const { ObjectId } = require("mongodb");

// 
const mongo = require("./mongo");


// Open the mongodb connection

// Create and open servers
// Express
const app = express();

// PORTS for socket and webserver
const SOCKET_PORT = 4000;
const SERVER_PORT = 3001;


// Socket IO
const client = socketIO().listen(SOCKET_PORT).sockets;

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Setup routes
app.post("/auth", (req, res) => {
  // Some dummy userid assigned at runtime
  const userId = new ObjectId();

  const token = jwt.sign({ user_data: {
    name: "SOME USER NAME",
  } }, "itismysigningkeywhichiuseforsigning", {
    subject: String(userId),
    audience: "jwt-socket-test-zmslm", // Realm Application Id
    algorithm: "HS256", // Algoritm selected in the realm
    expiresIn: "2 days"
  });

  res.status(200).send({
    token: token
  })
})


client.on("connection", async (soc) => {
  console.log("You are being served on 4000");
  const {db, close} = await mongo.open("eshow");

  // Start listening
  soc.on("input", async (payload) => {

    console.log("Got the payload", payload);
  
    // save the message
    await db.collection("messages").insertOne(payload);
  
    // Emit it via socket
    client.emit(`output-${payload.recevier}`, payload);
  })  
});


// Start listening over http
http.createServer(app).listen(SERVER_PORT);
