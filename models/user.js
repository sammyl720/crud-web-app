const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true

  },
  posts: [{
      postId: {
        type: mongoose.Types.ObjectId,
        ref:'Post',
        required:true,
        likes:[{
          type:mongoose.Types.ObjectId,
          ref:'User',
         }]
      },
       
      }
    ]
  
});


module.exports = mongoose.model("User", userSchema);