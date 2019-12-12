'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');
var controller = {

    datosCcurso: (req, res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Pedro Moreno',
            url: 'pbweb.es'
        })
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la accion test de mi controlador articulos'
        })
    },

    save: (req, res) => {
        //Recoger parametros por post
        var params = req.body;
        console.log(params);
        //Validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content) {
            //Crear el objeto a guardar
            var article = new Article();
            //Asignar valores
            article.title = params.title;
            article.content = params.content;
            if(article.image){
                article.image = params.image;
            }else{
                article.image = null;
            }

            
            //Guardar articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado'
                    });
                }
                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    article
                })
            });
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son validados'
            })
        }


    },
    getArticles: (req, res) => {

        var query = Article.find({});
        var last = req.params.last;

        if (last || last != undefined) {
            query.limit(5);
        }

        //Find
        Article.find({}).sort('id').exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: ' No hay articulos que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        })

    },

    getArticle: (req, res) => {

        //Recoger id url
        var articleId = req.params.id;
        //Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo'
            });
        }
        //Buscar el articulo
        Article.findById(articleId, (err, article) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los datos'
                });
            }
            if (!article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar'
                });
            }
            return res.status(200).send({
                status: 'success',
                article
            });

            //Devolverlo en Json


            return res.status(404).send({
                status: 'error',
                message: ' No hay articulos que mostrar'
            });
        });


    },

    update: (req, res) => {
        //Recoger id articulo por la url
        var articleId = req.params.id;

        //REcoger los datos que llegan por put
        var params = req.body;
        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })
        }
        if (validate_title && validate_content) {
            //Find and update
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'La validacion no es correcta'
                    });
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });

            });
        } else {
            //Devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validacion no es correcta'
            })
        }
    },

    delete: (req, res) => {
        //Recoger la id de la url
        var articleId = req.params.id;

        //Find and delete
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo'
                });
            }
            return res.status(200).send({
                status: 'success',
                article: articledRemoved
            });
        });

    },

    upload: (req, res) => {
        //Configurar el modulo del connect multiparty : router/article.js (hecho)

        //Recoger el fichero de la peticion
        var file_name = 'Imagen no subida...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        //Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // *Advertencia en linux o mac
        //var file_split = file_path.split('\\');

        //Nombre del archivo
        var file_name = file_split[2];
        //Extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //Comprobar la extension, solo imagenes y si no es valida borrar el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            //borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                });
            })
        } else {
            //Si todo es valido
            var articleId = req.params.id;
            if (articleId) {
                //Buscar el articulo, asignar el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdated) => {

                    if (err || !articleUpdated) {
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error al guardar la imagen de articulo'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
            }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
            }
            

        }
    }, //end upload file

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        });

    },

    search: (req, res) => {
        //Sacar el string a buscar
        var searchString = req.params.search;
        //Find or
        Article.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        })
            .sort([
                ['date, descending']
            ])
            .exec((err, articles) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }
                if (!articles || articles.length <= 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay articulos que coincidan con tu busqueda'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    articles
                });
            });


    }

}; // end controller

module.exports = controller;