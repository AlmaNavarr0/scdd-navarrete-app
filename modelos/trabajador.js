const mongoose=require('mongoose');
const trabajadorSchema = new mongoose.Schema({
        foto_trabajador:{
            type:String,
        },
        //Fecha de inicio
        dia_inicio:{
            type:Number,
            required:true
        },
        mes_inicio:{
            type:String,
            required:true
        },
        anyo_inicio:{
            type:Number,
            required:true,
        },
        //Nombre del trabajador
        nombre_trabajador:{
            type:String,
            required:true,
        },
        rfc_trabajador:{
            type:String,
            required:true,
            unique:true,
        },
        curp_trabajador: {
            type:String,
            required:true,
            unique:true,
        },
        //Dirección del trabajador
        numero_direccion:{
            type:String,
            required:true
        },
        calle_direccion:{
            type:String,
            required:true
        },
        colonia_direccion:{
            type:String,
            required:true
        },
        municio_direccion:{
            type:String,
            required:true
        },
        estado_direccion:{
            type:String,
            required:true
        },
        //Datos general
        email_trabajador:{
            type:String,
            required:true,
            unique:true,
        },
        telefono_trabajador:{
            type:String,
            required:true,
            unique:true,
        },
        puesto_trabajador:{
            type:String,
            required:true
        },
        salario_trabajador:{
            type:Number,
            required:true
        },
        //Cumpleaños
        dia_nacimiento:{
            type:Number,
            required:true
        },
        mes_nacimiento:{
            type:String,
            required:true
        },
        anyo_nacimiento:{
            type:Number,
            required:true
        },
        //Beneficiario
        nombre_beneficiario_principal:{
            type:String,
            required:true,
        },
        telefono_beneficiario_principal:{
            type:String,
            required:true,
            unique:true,
        },
        nombre_beneficiario_secundario:{
            type:String,
        },
        telefono_beneficiario_secundario:{
            type:String,
        },
        //Fecha de licencia
        dia_licencia:{
            type:Number,        },
        mes_licencia:{
            type:String,        },
        anyo_licencia:{
            type:Number,
        },
        licencia_vigente:{
            type:String,
        },
        //Fecha de examen
        dia_examen:{
            type:Number,        },
        mes_examen:{
            type:String,        },
        anyo_examen:{
            type:Number,
        },
        examen_vigente: {
            type:String,
        },
        //Fecha del tarjeton
        dia_tarjeton :{
            type:Number,        },
        mes_tarjeton :{
            type:String,        },
        anyo_tarjeton :{
            type:Number,
        },
        tarjeton_vigente: {
            type:String,
        },
        //Despido
        status_trabajador:{
            type:Boolean,
            required:true
        },
        motivo_despido:{
            type: String
        },
        fecha_despido:{
            type:String
        }
});
module.exports=mongoose.model('trabajadores', trabajadorSchema);