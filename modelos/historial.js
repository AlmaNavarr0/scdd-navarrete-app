const mongoose=require('mongoose');
const historialSchema = new mongoose.Schema({
        dia_historial:{
            type:Number,
                    },
        mes_historial:{
            type:String,
                    },
        anyo_historial:{
            type:Number,
        },
        numero_cambio: {
            type:String,
                    },
        formato_cambio:{
            type:String,
        },
        nombre_encargado:{
            type:String,
        },
        email_encargado:{
            type:String,
        },
        fecha_hora_emision:{
            type:String,
            unique: true,
            require: true
        }
});
module.exports=mongoose.model('historial', historialSchema);