const express = require('express');
const ruta = express.Router();
const Permiso = require('../modelos/permisos');
const Rutas = require('../modelos/rutas');
const Trabajador = require('../modelos/trabajador');
const Flotilla = require('../modelos/flotilla');
const Historial = require('../modelos/historial');
const path = require('path'); 
const notifier = require('node-notifier'); //Alertas
const nodemailer = require('nodemailer'); //Enviar correo
var moment = require('moment');
const multer = require('multer'); //Subir archivos

const uniqueSuffix = Math.round(Math.random() * 1E5);

const fecha = new Date();
var fecha_string = fecha.toDateString().slice(4);
var now = moment().format("DD/MM/YYYY HH:mm:ss A");

//Numero aleatorio
const unique = Math.round(Math.random() * 1E9);

/*METOODS*/ 
function uploadFiles() {
    const storage = multer.diskStorage({
        destination: path.join(__dirname, '../archivos/rutas'),
        filename: function (req, file, cb) {
          cb(null, unique+'-'+file.originalname )
        }
    });
    const upload = multer({ storage, dest: path.join(__dirname, '../archivos/rutas') }).fields([{name: 'pdffFile'}]) ;
    return upload;
}

ruta.get('/panel/administracion/solicitud-trabajador', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Permiso.find().sort({fecha_permiso: 1, nombre_trabajador: 1})
    .then((trabajador)=>{
        Trabajador.find({"status_trabajador": true}).sort({nombre_trabajador:1})
        .then((tra)=>{
            res.render('solicitud-permiso', {
                trabajadores:trabajador,
                permiso:tra,
                usuario: req.session.usuario,
                foto: req.session.foto,
                correo: req.session.correo,
                puesto: req.session.puesto
            });
        })
    })
    .catch((err)=>{
        console.log('No se pueden mostrar los permisos' + err);
    })
})

ruta.post('/panel/administracion/registrar_permiso', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
        console.log(req.body);

        const nombre = req.body.nombre_trabajador;
        const palabras_nombre = nombre.split(" ");
    
        for (let i = 0; i < palabras_nombre.length; i++) {
            palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
        }

        var permiso = new Permiso({
            numero_permiso: uniqueSuffix + '-' +  fecha_string,
            nombre_trabajador: palabras_nombre.join(" "),
            email_trabajador: req.body.email_trabajador,
            desc_permiso: req.body.exampleFormControlTextarea1, 
            fecha_permiso: req.body.dia_permiso + ' ' + req.body.mes_permiso + ' ' + req.body.anyo_permiso,
            horas_permiso: req.body.horas_permiso,
            fecha_registro_permiso: fecha_string
        });
        console.log(permiso);
        Trabajador.find({"nombre_trabajador": new RegExp(permiso.nombre_trabajador, 'i')}, (err, usuarioDB) => {
            if (usuarioDB.length>=1) {
                console.log(usuarioDB)
                permiso.save()
                .then(()=>{
                    notifier.notify({
                        title: 'SCDD | Permiso registrado',
                        message: 'Permiso registrado correctamente.',
                        icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                        sound: true,
                        timeout: 3,
                        sticky: true,
                        wait: false
                    });
                    res.redirect('/panel/administracion/solicitud-trabajador');
                })
                .catch((err)=>{
                    notifier.notify({
                        title: 'SCDD | Permiso no registrada',
                        message: 'Permiso no registrado correctamente.',
                        icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                        sound: true,
                        timeout: 3,
                        sticky: true,
                        wait: false
                    });
                    console.log('Error. No se ha podido registrar el permiso. ' + err);
                })
            } else {
                notifier.notify({
                    title: 'SCDD | Permiso no registrado',
                    message: 'El nombre del trabajador ingresado no esta registrado o en estado activo.',
                    icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                    sound: true,
                    timeout: 3,
                    sticky: true,
                    wait: false
                });
                res.redirect('/panel/administracion/solicitud-trabajador');
                console.log("Error en registrar el permiso")
            }
    })
});

/*´***************************** RUTAS *¨¨*¨¨¨¨¨¨¨¨*¨*¨***********/
ruta.get('/panel/administracion/registro-rutas', (req, res) =>{
    Rutas.find().sort({numero_ruta: 1})
    .then((rutas)=>{
        res.render('registro-rutas', {
            rutas:rutas,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((err)=>{
        
        console.log('No se pueden mostrar las rutas' + err);
    })
})

ruta.get('/panel/administracion/eliminar_permiso/:id', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    var idp = req.params.id;
    Permiso.findByIdAndRemove(idp)
    .then(()=>{
        res.redirect('/panel/administracion/solicitud-trabajador');
        notifier.notify({
            title: 'SCDD | Permiso eliminado',
            message: 'Permiso eliminado correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Permiso no eliminado',
            message: 'Permiso no eliminado correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/solicitud-trabajador');
        console.log('Error. No se pudo borrar el permiso '+ err);
    })
})

ruta.get('/panel/administracion/rol-personal', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Rutas.find().sort({numero_ruta: 1})
    .then((rutas)=>{
        Trabajador.find({"status_trabajador": true, $or: [{"puesto_trabajador": "Conductor de personal"}, {"puesto_trabajador": "Conductor turístico"}]})
        .then((trabajador)=>{
            Flotilla.find({"status_flotilla": true})
            .then((flotillas)=>{
                res.render('rol-personal', {
                    rutas:rutas,
                    trabajadores: trabajador, 
                    flotillas:flotillas,
                    usuario: req.session.usuario,
                    foto: req.session.foto,
                    correo: req.session.correo,
                    puesto: req.session.puesto
                });
            })
            .catch((err)=>{
                console.log('No se pueden mostrar las flotillas' + err);
            })
        })
        .catch((err)=>{
            console.log('No se pueden mostrar los trabajadores' + err);
        })
    })
    .catch((err)=>{
        console.log('No se pueden mostrar las rutas' + err);
    })
})

ruta.post('/panel/administracion/registrar_ruta', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
        console.log(req.body);

        var ruta = new Rutas({
            numero_ruta: req.body.numero_ruta, 
            origen_ruta: req.body.origen_ruta,
            destino_ruta: req.body.destino_ruta,
            hora_inicio_turno1: req.body.turno1,
            hora_inicio_turno2: req.body.turno2,
            hora_inicio_turno3: req.body.turno3,
        });
        console.log(ruta);
        ruta.save()
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Ruta registrada',
                message: 'Ruta registrada correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/registro-rutas');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Ruta no registrada',
                message: 'Ruta no registrada correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            console.log('Error. No se ha podido registrar la ruta. ' + err);
        })
})

ruta.post('/panel/administracion/modificar-ruta', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
        var id = req.body.id;
        Rutas.findByIdAndUpdate(id, {
            numero_ruta: req.body.ruta, 
            origen_ruta: req.body.prueba,
            destino_ruta: req.body.pruebados,
            hora_inicio_turno1: req.body.pruebatres,
            hora_inicio_turno2: req.body.pruebacuatro,
            hora_inicio_turno3: req.body.pruebacinco,
        })
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Ruta modificada',
                message: 'Ruta modificada correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/registro-rutas');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Ruta no modificada',
                message: 'Ruta no modificada, intente nuevamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            console.log('Error. No se ha podido registrar la ruta. ' + err);
        })
})

ruta.get('/panel/administracion/eliminar-ruta/:id', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    var id = req.params.id;
    Rutas.findByIdAndRemove(id)
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Ruta eliminada',
            message: 'Ruta eliminada correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/registro-rutas');
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Ruta no eliminada',
            message: 'Ruta no eliminada, intente nuevamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido registrar la ruta. ' + err);
    })

})

ruta.get('/panel/administracion/historial-cambios', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Historial.find().sort({fecha_hora_emision: 1})
    .then((historial)=>{
        res.render('historial-rutas', {
            historial:historial,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((err)=>{
        
        console.log('No se pueden mostrar el historial de cambios en rutas' + err);
    })
})

ruta.post('/panel/administracion/registrar_cambio', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
        console.log(req.body);

        var historial = new Historial({
            dia_historial: req.body.dia_cambio,
            mes_historial: req.body.mes_cambio,
            anyo_historial: req.body.anyo_cambio, 
            numero_cambio: req.body.numero_cambio,
            nombre_encargado: req.body.nombre,
            email_encargado: req.body.email,
            fecha_hora_emision: now

        });
        console.log(historial);
        historial.save()
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Rol de transporte de personal registrado',
                message: 'Datos registrado correctamente. Suba el archivo descargado.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/historial-cambios');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Rol de transporte no registrada',
                message: 'Rol de transporte no registrada correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            console.log('Error. No se ha podido registrar el rol de transporte por. ' + err);
        })
})

ruta.post('/panel/administracion/editar_historial', uploadFiles(), (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    console.log(req.body)
    Historial.findByIdAndUpdate(req.body.ide, {
        formato_cambio: unique + '-'+ req.body.nueva_licencia
    })
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Rol de transporte de personal subido',
            message: 'Archivo subido correctamente',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/historial-cambios');
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Rol de transporte no subido',
            message: 'Rol de transporte no subido correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido subir el rol de transporte por ' + err);
    })
})

ruta.get('/panel/administracion/eliminar_historial/:id', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Historial.findByIdAndRemove(req.params.id)
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Rol de transporte de personal eliminado',
            message: 'Archivo eliminado correctamente',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/historial-cambios');
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Rol de transporte no eliminado',
            message: 'Rol de transporte no eliminado correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido eliminar el rol de transportes por ' + err);
    })
})

module.exports = ruta;