const express = require('express');
const ruta = express.Router();
const Flotilla = require('../modelos/flotilla');
const path = require('path'); 
const multer = require('multer'); //Subir archivos
const notifier = require('node-notifier'); //Alertas
const nodemailer = require('nodemailer'); //Enviar correo

//Numero aleatorio
const uniqueSuffix = Math.round(Math.random() * 1E9);

/*METOODS*/ 
function uploadFiles() {
    const storage = multer.diskStorage({
        destination: path.join(__dirname, '../archivos/flotillas'),
        filename: function (req, file, cb) {
          cb(null, uniqueSuffix+'-'+file.originalname )
        }
    });
    const upload = multer({ storage, dest: path.join(__dirname, '../archivos/flotillas') }).fields([ {name: 'imagen'}, {name: 'pdffFile'}, {name: 'pdffFile2'}]) ;
    return upload;
}

/*RUTA PARA REGISTRAR FLOTILLAS*/
ruta.get('/panel/administracion/registro-flotilla', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find().limit(6)
    .then((flotilla)=>{
        res.render('registro-flotilla', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los usuarios');
    })
})

ruta.get('/panel/administracion/listado-flotilla', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find({"status_flotilla": true}).sort({numero_economico:1})
    .then((flotilla)=>{
        res.render('listado-flotillas', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los usuarios');
    })
})

/*RUTA PARA LA TABLA DE DATATABLES PARA FLOTILLAS*/
ruta.get('/panel/administracion/listado-completo-flotilla', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find().sort({numero_economico:1, status_flotilla:1})
    .then((flotilla)=>{
        res.render('lista-absoluta-flotilla', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los usuarios');
    })
})

ruta.get('/panel/administracion/bajas-flotillas', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find({"status_flotilla":false}).sort({numero_economico:1})
    .then((flotilla)=>{
        res.render('bajas-flotillas', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los usuarios');
    })
})

/*RUTA PARA EDITAR PERFIL DE UN TRABAJADOR*/
ruta.get('/panel/administracion/ver/:serie', (req, res) =>{
    var tra = req.params.serie;
    console.log(tra);
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.findOne({"numero_economico": tra})
    .then((flotilla)=>{
        res.render('editar-datos-flotilla', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((e)=>{
        console.log('No se pueden mostrar los usuarios ' + e);
    })
});

ruta.get('/panel/administracion/eliminar_flotilla/:id', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    const id = req.params.id;
    Flotilla.findByIdAndRemove(id)
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Flotilla eliminada.',
            message: 'Flotilla eliminada correctamente. Espere un momento, se actualiza la lista',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/bajas-flotillas')
    })
    .catch((e)=>{
        notifier.notify({
            title: 'SCDD | Flotilla no eliminada',
            message: 'Flotilla no eliminada correctamente. Intente nuevamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error en borrar la flotilla ' +e);
    })
})

/*RUTA PARA DAR LA LISTA DE FLOTILLAS*/
ruta.post('/panel/administracion/filtro-flotillas', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find({"tipo_flotilla": req.body.dia_inicio}).sort({numero_economico: 1})
    .then((flotilla)=>{
        res.render('listado-flotillas', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((err)=>{
        console.log('No se pueden mostrar los trabajadores, ' + err);
    })
});

/*¨RUTA PA´RA VER LAS BAJAS DE FLOTILLAS*/
ruta.post('/panel/administracion/filtro-flotillas-bajas', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.find({"tipo_flotilla": req.body.dia_inicio, "status_flotilla": false}).sort({numero_economico: 1})
    .then((flotilla)=>{
        res.render('bajas-flotillas', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((err)=>{
        console.log('No se pueden mostrar los trabajadores, ' + err);
    })
});

/*RUTA PARA ACTIVAR UNA FLOTILLA*/
ruta.post('/panel/admnistracion/activar-flotilla', (req, res)=>{
    var todo = req.body.id;
    console.log(req.body)
    if(req.body.estado=='true'){
        if(req.body.motivo == ''){
            var comentario = 'Sin comentarios.';
        } else {
            comentario = req.body.motivo;
        }
        Flotilla.findByIdAndUpdate(todo, {
            status_flotilla: true,
            motivo_baja: comentario + " (Reactivada en la fecha: " + req.body.fecha_m+').',
        })
        .then((trabajador)=>{
            notifier.notify({
                title: 'SCDD | Flotilla activa',
                message: 'Flotilla activada correctamente. Espere un momento, se actualiza la lista',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-flotilla');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Flotilla no activa',
                message: 'Hubo un error, intente nuevamente activar la flotilla.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/bajas-flotillas');
        }) 
    }
})

/*RUTA POST PARA REGISTRAR UNA FLOTILLA*/
ruta.post('/panel/administracion/registrar_flotilla', uploadFiles(), (req, res)=>{
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const palabras_nombre = nombre.split(" ");
    const palabras_apellidos = apellidos.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    for (let i = 0; i < palabras_apellidos.length; i++) {
        palabras_apellidos[i] = palabras_apellidos[i][0].toUpperCase() + palabras_apellidos[i].substr(1);
    }

    var flotilla = new Flotilla({
        foto_flotilla: uniqueSuffix+ '-' + req.body.imagen_nueva,
        nombre_propietario: palabras_nombre.join(" ") + ' ' + palabras_apellidos.join(" "),
        numero_economico: req.body.numero_eco,
        tipo_placas_flotilla:  req.body.tipo_placas,
        placas_flotilla: req.body.placas.toUpperCase(),
        numero_serie: req.body.numero_se.toUpperCase(),
        numero_permiso: req.body.numero_permiso.toUpperCase(),
        motor_flotilla: req.body.motor.toUpperCase(),
        tipo_flotilla: req.body.tipo_flotilla_string,
        dia_seguro: req.body.dia_seguro,
        mes_seguro: req.body.mes_seguro,
        anyo_seguro: req.body.anyo_seguro,
        seguro_flotilla: uniqueSuffix+ '-' +req.body.nueva_licencia,
        dia_verificacion: req.body.dia_verificacion,
        mes_verificacion: req.body.mes_verificacion,
        anyo_verificacion: req.body.anyo_verificacion,
        verificacion_flotilla: uniqueSuffix+ '-' +req.body.nueva_licencia2,
        tipo_flotilla:req.body.tipo_flotilla_string,
        tipo_verificacion: req.body.tipo_verificacion,
        status_flotilla: true
    });
    console.log(flotilla);
    flotilla.save()
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Flotilla registrada',
            message: 'Se registro correctamente la flotilla',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/listado-flotilla');
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Flotilla no registrada',
            message: 'Intente nuevamente al registrar la flotilla',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido registrar la flotilla: ' + err);
    })
})

/*RUTA PARA EDITAR PERFIL DE UN TRABAJADOR*/
ruta.post('/panel/administracion/editar_flotilla', (req, res) =>{
    var tra = req.body;
    console.log(tra);
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Flotilla.findOne({"numero_serie": req.body.correo_editar})
    .then((flotilla)=>{
        res.render('editar-datos-flotilla', {
            flotillas:flotilla,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch((e)=>{
        console.log('No se pueden mostrar la flotilla ' + e);
    })
});

/*RUTA PARA DAR DE BAJA A UN TRABAJADOR*/
ruta.post('/panel/administracion/modificar_flotilla', (req, res) =>{
    var todo = req.body.id;
    console.log(req.body)
    if(req.body.estado=='false'){
        if(req.body.motivo == ''){
            var comentario = 'Sin comentarios.';
        } else {
            comentario = req.body.motivo;
        }
        Flotilla.findByIdAndUpdate(todo, {
            motivo_baja: comentario + ' (Fecha de baja: '+ req.body.fecha_m +')',
            status_flotilla: false
        })
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Flotilla fuera de servicio',
                message: 'Flotilla dada de baja, ver lista de fuera de servicio.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/bajas-flotillas');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Flotilla no dada de baja',
                message: 'Hubo un error, intente nuevamente dar de baja a la flotilla.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-flotillas');
        }) 
    }
});

/*RUTA PARA MODIFICAR LOS DATOS DE LAS FLOTILLAS*/
ruta.post('/panel/administracion/editar_flotilla_activa', uploadFiles(), (req, res)=>{
    const nombre = req.body.nombre;
    const palabras_nombre = nombre.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    if(req.body.imagen_nueva == '' || req.body.imagen_dos[req.body.imagen_dos.length-1]=='-'){
        var imagen = req.body.imagen_dos;
    } else {
        imagen = uniqueSuffix+ '-' + req.body.imagen_nueva;
    }

    if(req.body.nueva_licencia == '' || req.body.licencia_actual[req.body.licencia_actual.length-1]=='-'){
        var licencia = req.body.licencia_actual;
    } else {
        licencia = uniqueSuffix+ '-' + req.body.nueva_licencia;
    }

    if(req.body.nueva_licencia2 == '' || req.body.examen_actual[req.body.examen_actual.length-1]=='-'){
        var examen = req.body.examen_actual;
    } else {
        examen = uniqueSuffix+ '-' + req.body.nueva_licencia2;
    }

    const idf = req.body.identidad;
    console.log(idf);
    Flotilla.findByIdAndUpdate(idf, {
        foto_flotilla: imagen,
        nombre_propietario: palabras_nombre.join(" "),
        numero_economico: req.body.numero_eco,
        tipo_placas_flotilla:  req.body.tipo_placas,
        placas_flotilla: req.body.placas.toUpperCase(),
        numero_serie: req.body.numero_se.toUpperCase(),
        numero_permiso: req.body.numero_per.toUpperCase(),
        motor_flotilla: req.body.numero_motor.toUpperCase(),
        tipo_flotilla: req.body.tipo_flotilla_string,
        dia_seguro: req.body.dia_seguro,
        mes_seguro: req.body.mes_seguro,
        anyo_seguro: req.body.anyo_seguro,
        seguro_vigente: licencia,
        dia_verificacion: req.body.dia_verificacion,
        mes_verificacion: req.body.mes_verificacion,
        anyo_verificacion: req.body.anyo_verificacion,
        verificacion_vigente: examen,
        tipo_verificacion:req.body.tipo_verificacion,
        status_flotilla: true
    })
    .then((flotilla)=>{
        notifier.notify({
            title: 'SCDD | Flotilla modificada',
            message: 'Se actualiza correctamente la flotilla',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/ver/'+flotilla['numero_economico']);
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Error en modificar',
            message: 'Flotilla no modificada. Intente nuevamente correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido modificar el usuario. ' + err);
    })
})

ruta.post(('/panel/administracion/buscar-numero-economico'), (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    console.log(req.body);
    if(req.body.numero_economico==''){var numero_economico='nulo';} else{numero_economico= req.body.numero_economico;}
    if(req.body.numero_serie==''){var numero_serie='nulo';} else{numero_serie= req.body.numero_serie;}
    if(req.body.numero_permiso==''){var numero_permiso='nulo';} else{numero_permiso= req.body.numero_permiso;}
    Flotilla.find({ $or: [{ "numero_economico": new RegExp(numero_economico, 'i')}, { "numero_serie": new RegExp(numero_serie, 'i')}, { "numero_permiso": new RegExp(numero_permiso, 'i')}]})
    .then((flotilla)=>{
        console.log(flotilla)
        if(flotilla.length==0){
            notifier.notify({
                title: 'SCDD | Registro no encontrado',
                message: 'Lo que desea buscar, no se encuntra registrado',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
        }else{
            res.render('lista-absoluta-flotilla', {
                flotillas:flotilla,
                usuario: req.session.usuario,
                foto: req.session.foto,
                correo: req.session.correo,
                puesto: req.session.puesto
            });
        }
    })
    .catch(()=>{
        console.log('No se pueden mostrar las flotillas');
    })
});
module.exports = ruta;