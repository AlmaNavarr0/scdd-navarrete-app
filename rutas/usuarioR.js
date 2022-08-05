const express = require('express');
const ruta = express.Router();
const Usuario = require('../modelos/usuario');
const Flotilla = require('../modelos/flotilla');
const Permiso = require('../modelos/permisos');
const Historial = require('../modelos/historial');
const Rutas = require('../modelos/rutas');
const Trabajador = require('../modelos/trabajador');
const path = require('path'); 
const multer = require('multer'); //Subir archivos
const alert = require('alert');
const notifier = require('node-notifier'); //Alertas
const nodemailer = require('nodemailer'); //Enviar correo

//Numero aleatorio
const uniqueSuffix = Math.round(Math.random() * 1E9);

//Metodos y fecha actual
const fecha = new Date();
var fecha_string = fecha.toDateString().slice(4);
var year = fecha.getFullYear(); 
var dia = fecha.getDate();
var mes = fecha.getMonth() + 1;
var mess = fecha.getMonth() + 2;

var mes_string = '';
var mes_strin = '';
if(mes==1){ mes_string='Ene'} if(mes==5){ mes_string='May'} if(mes==9){ mes_string='Sep'}
if(mes==2){ mes_string='Feb'} if(mes==6){ mes_string='Jun'} if(mes==10){ mes_string='Oct'} 
if(mes==3){ mes_string='Mar'} if(mes==7){ mes_string='Jul'} if(mes==11){ mes_string='Nov'}
if(mes==4){ mes_string='Abr'} if(mes==8){ mes_string='Ago'} if(mes==12){ mes_string='Dic'}

if(mess==1){ mes_strin='Ene'} if(mess==5){ mes_strin='May'} if(mess==9){ mes_strin='Sep'}
if(mess==2){ mes_strin='Feb'} if(mess==6){ mes_strin='Jun'} if(mess==10){ mes_strin='Oct'} 
if(mess==3){ mes_strin='Mar'} if(mess==7){ mes_strin='Jul'} if(mess==11){ mes_strin='Nov'}
if(mess==4){ mes_strin='Abr'} if(mess==8){ mes_strin='Ago'} if(mess==12){ mes_strin='Dic'}


function sumarDias(fecha, dias){
  fecha.setDate(fecha.getDate() + dias);
  var string = fecha.toString();
  return string.substring(8,10);
}

/*METOODS*/ 
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../archivos/usuarios'),
    filename: function (req, file, cb) {
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage, dest: path.join(__dirname, '../archivos/usuarios') });


/*RUTAS GET*/
ruta.get('/', (req, res) => {
    res.render('inicio');
});

ruta.get('/recuperaciondecuenta', (req, res) =>{
    res.render('crearcuenta');
});

ruta.get('/logout', (req, res) => {
    req.session.usuario = null;
    req.session.foto = null;
    req.session.correo = null;
    req.session.puesto = null;
    req.session.destroy();
    res.redirect('/');
});

ruta.get('/panel/administracion', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/');
    }
    Trabajador.find({
        "status_trabajador": true,
        "mes_nacimiento": new RegExp(mes_string, 'i'),
        "dia_nacimiento": { $gt: dia - 1 },
        "anyo_nacimiento": year,
        }).sort({ mes_nacimiento: 1, dia_nacimiento: 1 }).limit(3)
        .then((results) => {
            Trabajador.find({
                $or: [{$and: 
                    [{"mes_licencia": new RegExp(mes_string, 'i')}, {"dia_licencia": {$gte: dia-1}}]}, {$and: [{"mes_licencia": new RegExp(mes_strin, 'i')}, {"dia_licencia": {$lte: sumarDias(fecha, 5)}}]}], "status_trabajador": true, "anyo_licencia":year
                }).sort({ mes_licencia: 1, dia_licencia: 1 }).limit(3)
                .then((resultas) => {
                    Trabajador.find({
                        $or: [{$and: 
                            [{"mes_examen": new RegExp(mes_string, 'i')}, {"dia_examen": {$gte: dia-1}}]}, {$and: [{"mes_examen": new RegExp(mes_strin, 'i')}, {"dia_examen": {$lte: sumarDias(fecha, 5)}}]}], "status_trabajador": true, "anyo_examen":year
                                     }).sort({ mes_examen: 1, dia_examen: 1 }).limit(3)
                        .then((resultads) => {
                            Trabajador.find({
                                $or: [{$and: 
                                    [{"mes_tarjeton": new RegExp(mes_string, 'i')}, {"dia_tarjeton": {$gte: dia-1}}]}, {$and: [{"mes_tarjeton": new RegExp(mes_strin, 'i')}, {"dia_tarjeton": {$lte: sumarDias(fecha, 5)}}]}], "status_trabajador": true, "anyo_tarjeton":year
                               }).sort({ mes_tarjeton: 1, dia_tarjeton: 1 }).limit(3)
                                .then((resultados) => {
                                    Flotilla.find({
                                        $or: [{$and: 
                                            [{"mes_seguro": new RegExp(mes_string, 'i')}, {"dia_seguro": {$gte: dia-1}}]}, {$and: [{"mes_seguro": new RegExp(mes_strin, 'i')}, {"dia_seguro": {$lte: sumarDias(fecha, 5)}}]}], "status_flotilla": true, "anyo_seguro":year}).limit(3)
                                        .then((resp) => {
                                            Flotilla.find({
                                                $or: [{$and: 
                                                    [{"mes_verificacion": new RegExp(mes_string, 'i')}, {"dia_verificacion": {$gte: dia-1}}]}, {$and: [{"mes_verificacion": new RegExp(mes_strin, 'i')}, {"dia_verificacion": {$lte: sumarDias(fecha, 5)}}]}], "status_flotilla": true, "anyo_verificacion":year
                                                       }).limit(3)
                                                .then((veri) => {
                                                    Rutas.find({}).limit(6)
                                                        .then((resr) => {
                                                            res.render('vistaadministracion', {
                                                                trabajadores: results,
                                                                tra: resultas,
                                                                examen: resultads,
                                                                tarjeton: resultados,
                                                                flotillas: resp,
                                                                veri: veri,
                                                                rutas: resr,
                                                                usuario: req.session.usuario,
                                                                foto: req.session.foto,
                                                                correo: req.session.correo,
                                                                puesto: req.session.puesto
                                                            })
                                                        })
                                                })
                                        })
                                })
                        })
                })
            })
    /*Trabajador.find({
        "status_trabajador": true,
    }, (error, results) => {
        if (error) throw error;
        Flotilla.find({
            "status_flotilla": true,
        }, (error, resp) => {
            if (error) throw error;
            Rutas.find({}, (error, resr)=>{
                if (error) throw error;
                res.render('vistaadministracion', {
                    trabajadores:results,
                    flotillas: resp, 
                    rutas: resr,
                    usuario: req.session.usuario,
                    foto: req.session.foto,
                    correo: req.session.correo,
                    puesto: req.session.puesto
                });
            })
        });
    });*/
});

ruta.get('/panel/administracion/eliminar_usuario/:id', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    const idu = req.params.id;
    Usuario.findByIdAndRemove(idu)
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Usuario eliminado.',
            message: 'Usuario eliminado, espere se actualiza la lista',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/listado-usuarios');
    })
    .catch((e)=>{
        notifier.notify({
            title: 'SCDD | Error en eliminar el usuario',
            message: 'Intente nuevamente, error en eliminar.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error en eliminar el usuario ' + e);
    })
});

ruta.get('/panel/logistica', (req, res) => {
    Flotilla.find({ "status_flotilla": true }).limit(3)
        .then((resp) => {
            Historial.find({}).limit(3).sort({numero_cambio:1})
                .then((history) => {
                    Rutas.find({}).limit(8)
                    .then((resr) => {
                    res.render('vistaLogistica', {
                        usuario: req.session.usuario,
                        foto: req.session.foto,
                        correo: req.session.correo,
                        puesto: req.session.puesto,
                        flotillas: resp,
                        veri: history,
                        rutas: resr,
                    });
                })
            })
        })
})



ruta.get('/panel/administracion/registro-usuario', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Usuario.find().limit(4)
    .then((usuarios)=>{
        res.render('registro-usuario', {
            usuarios:usuarios,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los usuarios');
    })
});

ruta.get('/panel/administracion/listado-usuarios', (req, res) =>{
    if (!req.session.usuario) {
     res.redirect('/');
    } 
    Usuario.find().sort({fecha_registro_usuario:1})
    .then((usuarioDB)=>{
        res.render('listado-usuarios', {
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto,
            usuarios:usuarioDB});
    })
    .catch((err)=>{
        console.log('Error ' + err);
    })
});

/*RUTA PARA DAR LA LISTA DE FLOTILLAS*/
ruta.post('/panel/administracion/filtro-usuarios', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Usuario.find({"tipo_usuario": req.body.dia_inicio}).sort({numero_economico: 1})
    .then((usuarios)=>{
        res.render('listado-usuarios', {
            usuarios:usuarios,
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

ruta.get('/panel/administracion/perfil-usuario', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/');
    }
    var id = req.session._id;
    Usuario.findById(id)
        .then((usu) => {
            console.log(usu);
            res.render('perfil-usuario', {
                usu: usu,
                usuario: req.session.usuario,
                foto: req.session.foto,
                correo: req.session.correo,
                puesto: req.session.puesto
            });
        })
        .catch((err) => {
            console.log('ERROR. Error al mostrar los datos del usuario' + err);
        })
});

ruta.get('/panel/ayuda', (req, res) => {
    if (!req.session.usuario) {
        res.redirect('/');
    } res.render('ayuda', {
        usuario: req.session.usuario,
        foto: req.session.foto,
        correo: req.session.correo,
        puesto: req.session.puesto
    });
});

/*INICIAR SESION*/
ruta.post('/iniciarsesion', (req, res)=>{
    let body = req.body;
    console.log(body);
    Usuario.findOne({ email_usuario: body.email, status_usuario:true }, (err, usuarioDB) => {
        if (usuarioDB) {
            var result = (body.password == usuarioDB.password_usuario);
            //Variables de sesión
            req.session._id= usuarioDB._id,
            req.session.usuario = usuarioDB.nombre_usuario;
            req.session.foto = usuarioDB.foto_usuario;
            req.session.correo = usuarioDB.email_usuario;
            req.session.puesto = usuarioDB.tipo_usuario;
            if (result) {
                var rol = (usuarioDB.tipo_usuario);
                if (rol == "Administración") {
                    res.redirect('/panel/administracion');
                }
                if (rol == "Logística") {
                    res.redirect('/panel/logistica');
                }
            } else {
                notifier.notify({
                    title: 'SCDD | Error en la contraseña',
                    message: 'Su contraseña es incorrecta, intente nuevamente.',
                    icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                    sound: true,
                    timeout: 3,
                    sticky: true,
                    wait: false
                });
                console.log("Error en contraseña");
            }
        } else {
            notifier.notify({
                title: 'SCDD | Error en el correo',
                message: 'No existe activo en la base de datos. Hable con administrador.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            console.log('No emtras por que ' + err)
        }
    })
});

/*RECUPERACION DE CUENTA */ 
ruta.post('/contacta', (req, res) => {
    console.log(req.body);
    Usuario.findOne({
        "nombre_usuario": req.body.email
    })
        .then((usu) => {
            mensaje = `
            <div style="width: 100%;
            justify-content: center;
            text-align: center; 
            margin-top: -2%; 
            margin-left: 1.5%; 
            z-index: 1; 
            position: absolute; 
            background-image: linear-gradient(-60deg, rgba(36, 124, 139, 0.5) 15%, rgb(255,255, 255) 20%);">
            <br> 
            <div style="margin-top: 50px;">&nbsp;</div>
            <strong style="font-size: 19px; font-family: Arial, Helvetica, sans-serif; text-transform: uppercase; color: rgba(54, 89, 117, 0.99);">Recuperación de tu cuenta, <br>${usu['nombre_usuario']} </strong>
            <h2 style="font-family: Arial, Helvetica, sans-serif;">Manten tus datos seguros.</h2>
            <p  style="font-size: 19px; font-weight: bold; text-decorative:none; font-family: Arial, Helvetica, sans-serif; color: #000;"> Correo electrónico:  <br> <b style="text-decoration: none; color: #000;"> ${usu['email_usuario']} </b> <br> <br> Contraseña: <br>${usu['password_usuario']}</p>
            <br>
            <small style="font-family: Arial, Helvetica, sans-serif;">® Sistema de control de datos Navarrete. <br> No responder a este mensaje. Lindo día</small>
            <div style="margin-top: 50px;">&nbsp;</div>
            </div>
    `
            //Login
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'sistemacontrolnavarrete@gmail.com',
                    pass: 'vwxsmmxdtzjhdpjw'
                }
            }
                /*auth: {
                    //user: 'sistemacontrol@navarreteviajes.ml',
                    //pass: 'd3KVKa4wU9xZ1'
                    user: 'deliang.ti20@utsjr.edu.mx',
                    pass: 'tcmyjcpfbugsgcms'
                }*/
            );

            //Formar el correo, para ello llamamos los campos del formulario
            var datosCorreo = {
                from: '"Sistema de control Navarrete ☀" <sistemacontrolnavarrete@gmail.com>',
                to: usu['email_usuario'],
                subject: 'Sistema de control de datos y documentos Navarrete',
                //Texto en formato simple
                html: mensaje
            }
            //Enviar el correo
            transporter.sendMail(datosCorreo, (err, data) => {
                if (err) {
                    notifier.notify({
                        title: 'SCDD | Error en sus datos',
                        message: 'Su nombre no esta registrado en la base de datos.',
                        icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                        sound: true,
                        timeout: 3,
                        sticky: true,
                        wait: false
                    });
                    res.redirect('/recuperaciondecuenta');
                }
                else {
                    notifier.notify({
                        title: 'SCDD | Revise su correo',
                        message: 'Datos enviados a ' + usu['email_usuario'],
                        icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                        sound: true,
                        timeout: 3,
                        sticky: true,
                        wait: false
                    });
                    res.redirect('/');
                }
            });
        })
        .catch((err) => {
            console.log('Error en recuperar la cuenta. ' + err);
        })
});

/*USUARIO-REGISTRAR USUARIO*/ 
ruta.post('/panel/administracion/registrar_usuario', upload.single('imagen'), (req, res)=>{
    const nombre = req.body.firstName;
    const apellidos = req.body.lastName;
    const palabras_nombre = nombre.split(" ");
    const palabras_apellidos = apellidos.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    for (let i = 0; i < palabras_apellidos.length; i++) {
        palabras_apellidos[i] = palabras_apellidos[i][0].toUpperCase() + palabras_apellidos[i].substr(1);
    }

    var usuario = new Usuario({
        foto_usuario: uniqueSuffix+ '-' + req.body.imagen_nueva,
        nombre_usuario: palabras_nombre.join(" ") + ' ' + palabras_apellidos.join(" "),
        email_usuario: req.body.username,
        celular_usuario: req.body.address + req.body.celular,
        tipo_usuario: req.body.area,
        password_usuario: req.body.contrasena1,
        fecha_registro_usuario: fecha_string,
        status_usuario: true
    });
    console.log(usuario);
    usuario.save()
    .then(()=>{
        res.redirect('/panel/administracion/listado-usuarios');
    })
    .catch((err)=>{
        console.log('Error. No se ha podido registrar el usuario. ' + err);
    })
})

/*USUARIO-MODIFICAR USUARIO-PERFIL*/ 
ruta.post('/panel/administracion/modificar_usuario', upload.single('imagen'), (req, res)=>{
    const nombre = req.body.firstName;
    const palabras_nombre = nombre.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    if(req.body.imagen_nueva == ''){
        var imagen = req.body.imagen_dos;
    } else {
        imagen = uniqueSuffix+ '-' + req.body.imagen_nueva;
    }
    
    console.log(req.body);
    var id = req.body._id;
    Usuario.findByIdAndUpdate(id, {
        foto_usuario: imagen,
        nombre_usuario: palabras_nombre.join(" "),
        email_usuario: req.body.username,
        celular_usuario: req.body.celular,
        tipo_usuario: req.body.email,
        password_usuario: req.body.contrasena1,
        status_usuario: true
    })
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Modificación de datos',
            message: 'Inicie sesión nuevamente, por favor.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/');
    })
    .catch((err)=>{
        console.log('Error. No se ha podido modificar el usuario. ' + err);
    })
})

/*USUARIO-MODIFICAR USUARIO-LISTADO-DAR DE BAJA O ACTIVAR*/ 
ruta.post('/panel/administracion/modificar_estado', (req, res)=>{
    var todo = req.body.id;
    console.log(req.body)
    if(req.body.status=='false'){
        Usuario.findByIdAndUpdate(todo, {
            fecha_baja_usuario: req.body.fecha_m,
            status_usuario: false
        })
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Usuario dado de baja',
                message: 'Usuario dado de baja correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-usuarios');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Usuario no dado de baja',
                message: 'Usuario no dado de baja correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-usuarios');
        }) 
    } else if(req.body.status=='true'){
        Usuario.findByIdAndUpdate(todo, {
            fecha_registro_usuario: req.body.fecha_m,
            status_usuario: true
        })
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Usuario activado',
                message: 'Usuario dado de alta correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-usuarios');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Usuario no activado',
                message: 'Usuario no dado de alta correctamente. Intente nuevamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion');
        }) 
    }
    
})

ruta.post(('/panel/administracion/buscar-numero-usuario'), (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    console.log(req.body);
    if(req.body.nombre_usuario==''){var nombre_usuario='nulo';} else{nombre_usuario= req.body.nombre_usuario;}
    if(req.body.correo_usuario==''){var correo_usuario='nulo';} else{correo_usuario= req.body.correo_usuario;}
    if(req.body.area_trabajo==''){var area_trabajo='nulo';} else{area_trabajo= req.body.area_trabajo;}
    Usuario.find({$or:[{nombre_usuario: new RegExp(nombre_usuario, 'i')}, {email_usuario: new RegExp(correo_usuario, 'i')}, {tipo_usuario: new RegExp(area_trabajo, 'i')}]})
    .then((usuario)=>{
        console.log(usuario)
        if(usuario.length==0){
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
            res.render('lista-absoluta-usuarios', {
                usuarios:usuario,
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

ruta.get('/panel/administracion/listado-completo-usuarios', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Usuario.find().sort({nombre_usuario:1, status_usuario:1})
    .then((usuario)=>{
        res.render('lista-absoluta-usuarios', {
            usuarios:usuario,
            usuario: req.session.usuario,
            foto: req.session.foto,
            correo: req.session.correo,
            puesto: req.session.puesto
        });
    })
    .catch(()=>{
        console.log('No se pueden mostrar los trabajadores');
    })
})
module.exports = ruta;