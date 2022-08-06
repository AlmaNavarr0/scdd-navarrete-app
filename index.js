//Variables constantes
const express = require('express'); //Libreria que permite navegar por HTTP
const session = require('express-session'); //Manejo de sesiones
const usuario = require('./rutas/usuarioR');
const permiso = require('./rutas/permisoR');
const path = require('path'); //Ruta del archivos
const trabajador = require('./rutas/trabajadorR');
const flotilla = require('./rutas/flotillaR');
const mongoose=require('mongoose');

const app=express();

//Método para conectar a MongoDB
//Ruta de mongoDB, se crea un nuevo cloud en MongoDB Atlas 
mongoose.connect('mongodb+srv://AlmaNavarro:ardal09865@cluster0.jlspt.mongodb.net/siscontrol?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log("Conexión exitosa a la base de datos.");
})
.catch((err)=>{
    console.log("Hubo un problema en la conexión a la base de datos. "+err);
});


//Método para usar la app sin internet 
app.set('view engine','ejs'); //Formatos a usar

//Dar soporte a la lectura de un formulario
app.use(express.urlencoded({extended:true}));

//Uso de sesiones
app.use(session({
    secret: 'keyNavarrete',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static("archivos"));
app.use(express.static("estilos"));

//Levantamiento y acceso a las rutas de navegacion
app.use('/', usuario);
app.use('/', trabajador);
app.use('/', flotilla); 
app.use('/', permiso);

app.listen(process.env.PORT || 8080, function() {
console.log('Servidor escuchando en el puerto 8080');

});