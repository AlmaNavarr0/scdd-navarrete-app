const mongoose=require('mongoose');
const rutasSchema = new mongoose.Schema({
        numero_ruta:{
            type:String,
            unique:true,
        },
        origen_ruta:{
            type:String,
            required:true,
        },
        destino_ruta:{
            type:String,
        },
        hora_inicio_turno1: {
            type: String, 
            required: true
        },  
        hora_inicio_turno2: {
            type: String, 
            required: true
        },
        hora_inicio_turno3: {
            type: String, 
            required: true
        }
});
module.exports = mongoose.model('rutas', rutasSchema);