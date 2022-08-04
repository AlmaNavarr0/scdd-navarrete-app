const mongoose=require('mongoose');
const flotillaSchema = new mongoose.Schema({
        foto_flotilla:{
            type:String
        },
        nombre_propietario:{
            type:String,
            required:true,
        },
        numero_economico:{
            type:String,
            required:true,
            unique:true,
        },
        tipo_placas_flotilla:{
            type:String,
            required:true
        },
        placas_flotilla:{
            type:String,
            required:true
        },
        numero_serie:{
            type:String,
            unique:true,
            required:true
        },
        numero_permiso:{
            type:String,
            unique:true,
            required:true
        },
        motor_flotilla: {
            type:String,
            unique:true,
            required:true
        },
        //Documentos
        dia_seguro:{
            type:Number,
                    },
        mes_seguro:{
            type:String,
                    },
        anyo_seguro:{
            type:Number,
            
        },
        seguro_flotilla: {
            type:String,
                    },
        dia_verificacion:{
            type:Number,
                    },
        mes_verificacion:{
            type:String,
                    },
        anyo_verificacion:{
            type:Number,
            
        },
        tipo_verificacion: {
            type:String
        },
        verificacion_flotilla: {
            type:String
        },
        tipo_flotilla:{
            type:String,
            required: true,
                    },
        status_flotilla:{
            type:Boolean,
            required:true
        },
        motivo_baja:{
            type: String
        }
});
module.exports=mongoose.model('flotilla', flotillaSchema);