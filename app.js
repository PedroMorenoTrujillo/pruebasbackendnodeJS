'use strict'

// Cargar modulos de node para crear el servidor
var express = require('express');
var bodyParse = require('body-parser');

//Ejecutar express (http)
var app = express();

//Cargar ficheros rutas
var article_routes = require('./routes/article');

//Middlewares
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());

//Activar CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Añadir prefijos a rutas / cargar routas
app.use('/api', article_routes);

//Ruta de prueba
/*
app.post('/datos-curso', (req, res) => {

    return res.status(200).send({
        curso: 'Master en Frameworks JS',
        autor: 'Pedro Moreno',
        url: 'pbweb.es'
    })
});
*/

//Exportar modulo (fichero actual)
module.exports = app;