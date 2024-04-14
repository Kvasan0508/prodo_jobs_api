const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
   
    email:{
        type: String,
        required: [true, 'Please Enter The email'],
        unique:true,
        validate: [validator.isEmail,"please enter correct email address"]

    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        maxlength:[20,"password cannot exceed 20 characters"],
        select:false,
        validate: [validator.isStrongPassword,'Please enter one uppercase one lowercase and min 8 values']

    },
    
})
userSchema.pre('save',async function(next){
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password,10)
})
userSchema.methods.getJwtToken = function (){
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET ,{
        expiresIn: process.env.JWT_EXPIRES_TIME
    })

}
userSchema.methods.isValidPassword = async function(EnteredPassword){
   return  bcrypt.compare(EnteredPassword,this.password)
}

let model = mongoose.model('user', userSchema)
module.exports = model