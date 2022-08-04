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
        foto_encargado:{
            type: String,
        },
        nombre_encargado:{
            type:String,
        },
        fecha_emision:{
            type:String
        }
});
module.exports=mongoose.model('historial', historialSchema);