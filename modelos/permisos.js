const mongoose=require('mongoose');
const permisoSchema = new mongoose.Schema({
        numero_permiso:{
            type:String,
            unique:true,
        },
        nombre_trabajador:{
            type:String,
            required:true,
        },
        email_trabajador:{
            type:String,
            required:true,
        },
        desc_permiso:{
            type:String,
            required:true
        },
        fecha_permiso:{
            type:String,
            required:true
        },
        horas_permiso:{
            type:String,
            required:true
        },
        fecha_registro_permiso:{
            type:String
        }
});
module.exports = mongoose.model('permisos', permisoSchema);