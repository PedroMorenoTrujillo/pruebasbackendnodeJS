"use strict";

var mongoose = require("mongoose");
var app = require("./app");
var port = 5000;

mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb+srv://admin:admin@apirestblog-wewu6.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Conexion correcta a MongoDB");

    //Crear servidor y escuchar peticiones http
    app.listen(port, () => {
      console.log("Servidor corriendo en http://localhost:" + port);
    });
  });
