const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const EliteAdminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter name'],
        default:'elite'
    },
    email:{
        type:String,
        required:[true,'please enter the email id'],
        unique:true

    },
    password:{
        type:String,
        required:[true,'please enter the password']
    },
    role:{
        type:String,
        default:'elite'
    }
})

EliteAdminSchema.pre('save',async function(next){
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password,10)
})
EliteAdminSchema.methods.getJwtToken = function (){
    const secret = process.env.JWT_SECRET
    return jwt.sign({ id: this.id }, secret ,{
        expiresIn: process.env.JWT_EXPIRES_TIME
    })

}
EliteAdminSchema.methods.isCorrectEmail = async(original, encrypted) => {
    const decrypted = await decrypt(encrypted);
    return original === decrypted;
  };
  


EliteAdminSchema.methods.isValidPassword = async function(EnteredPassword){
   return  bcrypt.compare(EnteredPassword,this.password)
}

let model = mongoose.model('elite', EliteAdminSchema)
module.exports = model


