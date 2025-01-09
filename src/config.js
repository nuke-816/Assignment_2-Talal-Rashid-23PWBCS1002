const { name } = require("ejs");
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/SignIn")



connect.then(() => {
    console.log("Database connected Successfully");
})
.catch(()=> {
    console.log("Database cannot be connected"); 
});


const SignInScema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    }
});

//collection
const collection = new mongoose.model("user", SignInScema);

module.exports = collection;