const express = require('express');
const ruta = express.Router();
const Trabajador = require('../modelos/trabajador');
const path = require('path'); 
const Permiso = require('../modelos/permisos');
const multer = require('multer'); //Subir archivos
const notifier = require('node-notifier'); //Alertas
const nodemailer = require('nodemailer'); //Enviar correo

//Numero aleatorio
const uniqueSuffix = Math.round(Math.random() * 1E9);

/*METOODS*/ 
function uploadFiles() {
    const storage = multer.diskStorage({
        destination: path.join(__dirname, '../archivos/trabajadores'),
        filename: function (req, file, cb) {
          cb(null, uniqueSuffix+'-'+file.originalname )
        }
    });
    const upload = multer({ storage, dest: path.join(__dirname, '../archivos/trabajadores') }).fields([ {name: 'imagen'}, {name: 'pdffFile'}, {name: 'pdffFile2'}, {name: 'pdffFile3'}]) ;
    return upload;
}

/*RUTAS GET*/
ruta.get('/panel/administracion/registro-trabajador', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find().limit(6)
    .then((trabajador)=>{
        res.render('registro-trabajador', {
            trabajadores:trabajador,
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

ruta.get('/panel/administracion/cumpleanyo-trabajadores', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find({"status_trabajador": true}).sort({mes_nacimiento:1, dia_nacimiento: 1})
    .then((trabajador)=>{
        res.render('listado-cumpleayos', {
            trabajadores:trabajador,
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

/*RUTA PARA EDITAR PERFIL DE UN TRABAJADOR*/
ruta.get('/panel/administracion/ir/:correo', (req, res) =>{
    var tra = req.params.correo;
    console.log(tra);
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.findOne({"email_trabajador": tra})
    .then((trabajador)=>{
        res.render('editar-perfil-trabajador', {
            trabajadores:trabajador,
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

/*RUTA PARA EDITAR PERFIL DE UN TRABAJADOR*/
ruta.post('/panel/administracion/editar', (req, res) =>{
    var tra = req.body;
    console.log(tra);
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.findOne({"email_trabajador": req.body.correo_editar})
    .then((trabajador)=>{
        res.render('editar-perfil-trabajador', {
            trabajadores:trabajador,
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

/*RUTA PARA DAR DE BAJA A UN TRABAJADOR*/
ruta.post('/panel/administracion/modificar_trabajador', (req, res) =>{
    var todo = req.body.id;
    if(req.body.despido.includes('Veces dado de baja')){
        var despido = parseInt(req.body.despido.substr(-2));
        var despidos = despido + 1;
    } else {
        despidos = 1;
    }
    console.log(req.body)
    if(req.body.estado=='false'){
        if(req.body.motivo==''){
            var comentario = 'Sin comentarios. ';
        } else {
            comentario = req.body.motivo;
        }
        Trabajador.findByIdAndUpdate(todo, {
            fecha_despido: req.body.fecha_m,
            motivo_despido: comentario + ' (Veces dado de baja: '+ despidos +')',
            status_trabajador: false
        })
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Trabajador dado de baja',
                message: 'Trabajador dado de baja correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/bajas-trabajadores');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Trabajador no dado de baja',
                message: 'Hubo un error, intente nuevamente dar de baja al trabajador.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-trabajadores');
        }) 
    }
});

/*RUTA PARA ACTIVAR A UN TRABAJADOR*/
ruta.post('/panel/admnistracion/activar-trabajador', (req, res)=>{
    var todo = req.body.id_baja;
    console.log(req.body)
    if(req.body.estado_baja=='true'){
        Trabajador.findByIdAndUpdate(todo, {
            status_trabajador: true,
            dia_inicio: parseInt(req.body.fecha_m_baja.substr(4,5)),
            mes_inicio: req.body.fecha_m_baja.substr(0,3),
            anyo_inicio: parseInt(req.body.fecha_m_baja.substr(7,10))
        })
        .then((trabajador)=>{
            notifier.notify({
                title: 'SCDD | Trabajador activo',
                message: 'Trabajador activado correctamente.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/listado-trabajadores');
        })
        .catch((err)=>{
            notifier.notify({
                title: 'SCDD | Trabajador no activo',
                message: 'Hubo un error, intente nuevamente activar el trabajador.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/bajas-trabajadores');
        }) 
    }
})

/*RUTA PARA HACER EL LISTADO DE TRABAJADORES ACTIVOS*/
ruta.get('/panel/administracion/listado-trabajadores', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find({"status_trabajador": true}).sort({nombre_trabajador: 1, mes_licencia:1})
    .then((trabajador)=>{
        res.render('listado-trabajadores', {
            trabajadores:trabajador,
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

/*RUTA PARA HACER EL LISTADO DE BAJAS EN TRABAJADORES*/
ruta.get('/panel/administracion/bajas-trabajadores', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find({"status_trabajador": false}).sort({nombre_trabajador: 1})
    .then((trabajador)=>{
        res.render('bajas-trabajadores', {
            trabajadores:trabajador,
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

ruta.get('/panel/administracion/eliminar_trabajador/:id', (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    const idt = req.params.id;
    Trabajador.findByIdAndRemove(idt)
    .then((trabajador)=>{
        Permiso.remove({"nombre_trabajador": trabajador['nombre_trabajador']})
        .then(()=>{
            notifier.notify({
                title: 'SCDD | Trabajador eliminado',
                message: 'Se eliminó correctamente el trabajador y todo relacionado a él.',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
            res.redirect('/panel/administracion/bajas-trabajadores');
        })
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Trabajador no eliminado',
            message: 'No se pudo eliminar correctamente el trabajador',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
    })
})

/*CATEGORIAS EN TRABAJADORES ACTIVOS*/
ruta.post('/panel/administracion/filtro-trabajores', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find({"puesto_trabajador": req.body.dia_inicio}).sort({nombre_trabajador: 1, mes_licencia:-1, mes_examen:-1, mes_tarjeton:-1})
    .then((trabajador)=>{
        res.render('listado-trabajadores', {
            trabajadores:trabajador,
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

/*CATEGORIAS EN TRABAJADORES BAJAS*/
ruta.post('/panel/administracion/filtro-trabajores-bajas', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find({"status_trabajador": false, "puesto_trabajador": req.body.dia_inicio}).sort({nombre_trabajador: 1, mes_licencia:-1, mes_examen:-1, mes_tarjeton:-1})
    .then((trabajador)=>{
        res.render('bajas-trabajadores', {
            trabajadores:trabajador,
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

/*USUARIO-REGISTRAR USUARIO*/ 
ruta.post('/panel/administracion/registrar_trabajador', uploadFiles(), (req, res)=>{
    const nombre = req.body.nombre_trabajador;
    const apellidos = req.body.apellidos_trabajador;
    const palabras_nombre = nombre.split(" ");
    const palabras_apellidos = apellidos.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    for (let i = 0; i < palabras_apellidos.length; i++) {
        palabras_apellidos[i] = palabras_apellidos[i][0].toUpperCase() + palabras_apellidos[i].substr(1);
    }

    const nombre_bene = req.body.nombre_bene;
    const apellidos_bene = req.body.apellidos_bene;
    const palabras_nombre_b = nombre_bene.split(" ");
    const palabras_apellidos_b = apellidos_bene.split(" ");

    for (let i = 0; i < palabras_nombre_b.length; i++) {
        palabras_nombre_b[i] = palabras_nombre_b[i][0].toUpperCase() + palabras_nombre_b[i].substr(1);
    }

    for (let i = 0; i < palabras_apellidos_b.length; i++) {
        palabras_apellidos_b[i] = palabras_apellidos_b[i][0].toUpperCase() + palabras_apellidos_b[i].substr(1);
    }

    if(req.body.nombre_bene_dos=='' || req.body.apellidos_bene_dos==''){
        var beneficiario = 'Sin beneficiario';
    } else {
        beneficiario = req.body.nombre_bene_dos + ' ' + req.body.apellidos_bene_dos;
    }

    if(req.body.celular_bene_dos == ''){
        var celular_benef_dos = 'Sin número celular';
    } else {
        celular_benef_dos = req.body.celular_bene_dos;
    }

    var trabajador = new Trabajador({
        foto_trabajador: uniqueSuffix+ '-' + req.body.imagen_nueva,
        dia_inicio: req.body.dia_inicio,
        mes_inicio: req.body.mes_inicio,
        anyo_inicio: req.body.anyo_inicio,
        nombre_trabajador: palabras_nombre.join(" ") + ' ' + palabras_apellidos.join(" "),
        rfc_trabajador: req.body.rfc_numero.toUpperCase(),
        curp_trabajador: req.body.curp.toUpperCase(),
        numero_direccion: req.body.numero_casa,
        calle_direccion: req.body.calle,
        colonia_direccion: req.body.colonia,
        municio_direccion: req.body.municipio,
        estado_direccion: req.body.estado,
        email_trabajador: req.body.correo,
        telefono_trabajador: req.body.celular,
        puesto_trabajador: req.body.puesto,
        salario_trabajador: req.body.salario,
        dia_nacimiento: req.body.dia_nacimiento,
        mes_nacimiento: req.body.mes_nacimiento,
        anyo_nacimiento: req.body.anyo_nacimiento,
        nombre_beneficiario_principal: palabras_nombre_b.join(" ") + ' ' + palabras_apellidos_b.join(" "),
        telefono_beneficiario_principal: req.body.celular_bene,
        nombre_beneficiario_secundario: beneficiario,
        telefono_beneficiario_secundario: celular_benef_dos,
        dia_licencia: req.body.dia_licencia,
        mes_licencia: req.body.mes_licencia,
        anyo_licencia: req.body.anyo_licencia,
        licencia_vigente: uniqueSuffix+ '-' +req.body.nueva_licencia,
        dia_examen: req.body.dia_examen,
        mes_examen: req.body.mes_examen,
        anyo_examen: req.body.anyo_examen,
        examen_vigente: uniqueSuffix+ '-' +req.body.nueva_licencia2,
        dia_tarjeton: req.body.dia_tarjeton,
        mes_tarjeton: req.body.mes_tarjeton,
        anyo_tarjeton: req.body.anyo_tarjeton,
        tarjeton_vigente: uniqueSuffix+ '-' +req.body.nueva_licencia3,
        status_trabajador: true
    });
    console.log(trabajador);
    trabajador.save()
    .then(()=>{
        notifier.notify({
            title: 'SCDD | Trabajador registrado',
            message: 'Se registro correctamente el trabajador',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/listado-trabajadores');
    })
    .catch((err)=>{+notifier.notify({
        title: 'SCDD | Trabajador no registrado',
        message: 'Intente de nuevo registrar a el trabajador',
        icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
        sound: true,
        timeout: 3,
        sticky: true,
        wait: false
    });
        console.log('Error. No se ha podido registrar el usuario. ' + err);
    })
})

/*RUTA PARA MODIFICAR POR COMPLETO LOS DATOS DE UN TRABAJADOR QUE ESTA ACTIVO*/
ruta.post('/panel/administracion/editar_trabajador_activo', uploadFiles(), (req, res)=>{
    const nombre = req.body.nombre_trabajador;
    const palabras_nombre = nombre.split(" ");

    for (let i = 0; i < palabras_nombre.length; i++) {
        palabras_nombre[i] = palabras_nombre[i][0].toUpperCase() + palabras_nombre[i].substr(1);
    }

    const nombre_bene = req.body.nombre_bene;
    const palabras_nombre_b = nombre_bene.split(" ");

    for (let i = 0; i < palabras_nombre_b.length; i++) {
        palabras_nombre_b[i] = palabras_nombre_b[i][0].toUpperCase() + palabras_nombre_b[i].substr(1);
    }

    if(req.body.nombre_bene_dos==''){
        var beneficiario = 'Sin beneficiario';
    } else {
        beneficiario = req.body.nombre_bene_dos;
    }

    if(req.body.celular_bene_dos == ''){
        var celular_benef_dos = 'Sin número celular';
    } else {
        celular_benef_dos = req.body.celular_bene_dos;
    }

    if(req.body.imagen_nueva == '' || req.body.imagen_nueva[req.body.imagen_nueva.length-1]=='-'){
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

    if(req.body.nueva_licencia3 == '' || req.body.tarjeton_actual[req.body.tarjeton_actual.length-1]=='-'){
        var tarjeton = req.body.tarjeton_actual;
    } else {
        tarjeton = uniqueSuffix+ '-' + req.body.nueva_licencia3;
    }

    Trabajador.findByIdAndUpdate(req.body.identidad, {
        foto_trabajador: imagen,
        dia_inicio: req.body.dia_inicio,
        mes_inicio: req.body.mes_inicio,
        anyo_inicio: req.body.anyo_inicio,
        nombre_trabajador: palabras_nombre.join(" "),
        rfc_trabajador: req.body.rfc_numero.toUpperCase(),
        curp_trabajador: req.body.curp.toUpperCase(),
        numero_direccion: req.body.numero_casa,
        calle_direccion: req.body.calle,
        colonia_direccion: req.body.colonia,
        municio_direccion: req.body.municipio,
        estado_direccion: req.body.estado,
        email_trabajador: req.body.correo,
        telefono_trabajador: req.body.celular,
        puesto_trabajador: req.body.puesto,
        salario_trabajador: req.body.salario,
        dia_nacimiento: req.body.dia_nacimiento,
        mes_nacimiento: req.body.mes_nacimiento,
        anyo_nacimiento: req.body.anyo_nacimiento,
        nombre_beneficiario_principal: palabras_nombre_b.join(" "),
        telefono_beneficiario_principal: req.body.celular_bene,
        nombre_beneficiario_secundario: beneficiario,
        telefono_beneficiario_secundario: celular_benef_dos,
        dia_licencia: req.body.dia_licencia,
        mes_licencia: req.body.mes_licencia,
        anyo_licencia: req.body.anyo_licencia,
        licencia_vigente: licencia,
        dia_examen: req.body.dia_examen,
        mes_examen: req.body.mes_examen,
        anyo_examen: req.body.anyo_examen,
        examen_vigente: examen,
        dia_tarjeton: req.body.dia_tarjeton,
        mes_tarjeton: req.body.mes_tarjeton,
        anyo_tarjeton: req.body.anyo_tarjeton,
        tarjeton_vigente: tarjeton,
        status_trabajador: true
    })
    .then((trabajador)=>{
        notifier.notify({
            title: 'SCDD | Trabajador modificado',
            message: 'Se actualiza correctamente el trabajador',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        res.redirect('/panel/administracion/ir/'+trabajador['email_trabajador']);
    })
    .catch((err)=>{
        notifier.notify({
            title: 'SCDD | Error en modificar',
            message: 'Trabajador no modificado. Intente nuevamente correctamente.',
            icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
            sound: true,
            timeout: 3,
            sticky: true,
            wait: false
        });
        console.log('Error. No se ha podido modificar el usuario. ' + err);
    })
})

/*CATEGORIAS EN TRABAJADORES BAJAS*/
ruta.post('/panel/administracion/buscar_nombre', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    var nombre = req.body.nombre;
    console.log(nombre);
    Trabajador.find({"nombre_trabajador": new RegExp(nombre, 'i')}).sort({dia_nacimiento: 1, mes_nacimiento:1})
    .then((trabajador)=>{
        res.render('listado-cumpleayos', {
            trabajadores:trabajador,
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

/*RUTA PARA EDITAR PERFIL DE UN TRABAJADOR*/
ruta.get('/panel/administracion/felicitar/:correo', (req, res) =>{
    var tra = req.params.correo;
    console.log(tra);
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.findOne({"email_trabajador": tra})
    .then((trabajador) => {
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
    <strong style="font-size: 19px; font-family: Arial, Helvetica, sans-serif; text-transform: uppercase; color: rgba(54, 89, 117, 0.99);">Felicidades <br>${trabajador['nombre_trabajador']} </strong>
    <div style="width=50%; margin-left=15%;"> <p  style="font-size: 19px; font-weight: bold; text-decorative:none; font-family: Arial, Helvetica, sans-serif; color: #000;"> A nombre de Transportes Turísticos Navarrete le hacemos llegar una cordial felicitación por su cumpleaños el día de hoy.</p></div>
    <small style="font-family: Arial, Helvetica, sans-serif;">- Se necesita un largo tiempo para crecer joven. Pablo Piccaso</small>
    <br> <br>
    <small style="font-family: Arial, Helvetica, sans-serif;">® Sistema de control de datos Navarrete. <br> Lindo día</small>
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
        to: trabajador['email_trabajador'],
        subject: 'Sistema de control de datos y documentos Navarrete',
        //Texto en formato simple
        html: mensaje
    }
    //Enviar el correo
    transporter.sendMail(datosCorreo, (err, data) => {
        if (err) {
            notifier.notify({
                title: 'SCDD | Error en enviar la felicitación',
                message: 'Hubo un error en mandar la felicitación, intente nuevamente',
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
        }
        else {
            notifier.notify({
                title: 'SCDD | Felicitación enviada',
                message: 'Mensaje enviado a ' + trabajador['email_trabajador'],
                icon: path.join(__dirname, '../archivos/imagenes/sinfondodos.png'),
                sound: true,
                timeout: 3,
                sticky: true,
                wait: false
            });
        }
    });
})
.catch((err) => {
    console.log('Error en recuperar la cuenta. ' + err);
})
});

ruta.post(('/panel/administracion/buscar-numero-trabajador'), (req, res) =>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    console.log(req.body);
    if(req.body.nombre_tra==''){var nombre_tra='nulo';} else{nombre_tra= req.body.nombre_tra;}
    if(req.body.correo_tra==''){var correo_tra='nulo';} else{correo_tra= req.body.correo_tra;}
    if(req.body.rfc==''){var rfc='nulo';} else{rfc= req.body.rfc;}
    Trabajador.find({$or: [{nombre_trabajador: new RegExp(nombre_tra, 'i')}, {email_trabajador:new RegExp(correo_tra, 'i')}, {rfc_trabajador: new RegExp(rfc, 'i')}]})
    .then((trabajador)=>{
        console.log(trabajador)
        if(trabajador.length==0){
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
            res.render('lista-absoluta-trabajadores', {
                trabajadores:trabajador,
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

ruta.get('/panel/administracion/listado-completo-trabajador', (req, res)=>{
    if (!req.session.usuario) {
        res.redirect('/'); } 
    Trabajador.find().sort({nombre_trabajador:1, status_trabajador:1})
    .then((trabajador)=>{
        res.render('lista-absoluta-trabajadores', {
            trabajadores:trabajador,
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