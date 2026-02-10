const mongoose = require('mongoose')

const UserSchecma= new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    phoneNumber:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String},
    role:{type:String, enum:['admin', 'user'], default:"user"}
}, {timestamps:true, strict:"throw"})

const UserModel =mongoose.model('user', UserSchecma)

module.exports= UserModel