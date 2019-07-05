const mongoose = require("mongoose");

const getTime = () => {
  const date = new Date();
  return date.toLocaleTimeString() + " - " + date.toLocaleDateString();
}
const postSchema = mongoose.Schema({
  user:{
    type:mongoose.Types.ObjectId
  },
  message:{
    type:String,
    required:true
  },
  time:{
    type:String,
    default: getTime()

  }
});


module.exports = mongoose.model("Post", postSchema);