const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
require("mongoose-type-email");

const adminSchema=new mongoose.Schema({
    userType:{
        type: String,
        enum: "Admin",
        required: true,
    },
    storeNumber: {
        type: String,
        required: true,
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})
// convert password into hashing
adminSchema.pre('save',function(next){
    console.log(next);
    let user=this;

    // if the data is not modified
    if(!user.isModified("password")){
        return next()
    }
    // do in bcrypt
    console.log("user", user);
    bcrypt.hash(user.password, 7, (err, hash) =>{
        if(err){
            return next(err)
        }
        user.password=hash
        next()
    })

});
module.exports=mongoose.model('adminStore', adminSchema)