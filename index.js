const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
require("dotenv").config();
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions'
});

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret:"my secret",
   resave:false, saveUninitialized:false,
   store: store
  })
);
const path = require("path");
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/includes/')]);

app.use((req,res,next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user){
      return next()
    }
    req.user = user;
    next();
  })
  .catch(err =>{
    next(new Error(err));
  });

});

app.use((req,res,next)=>{
  res.locals.isLoggedIn = req.session.user? true : false;
  next();
})

app.get("/login", (req,res,next)=>{
    res.render("auth/login");
});
app.post("/login", (req,res,next)=>{
  const {name, password } = req.body;
  User.findOne({name})
  .then(user => {
    if(!user){
      return res.redirect('/login');
      console.log(`Username ${name} not found`);
    }else{
      bcrypt.compare(password, user.password)
      .then(match => {
        if(match){
          req.session.user = user;
          res.redirect('/');
        }else{
          console.log(`Username/ Password is incorrect`);
          res.redirect('/login');
        }
      })
    }
  }).catch(err => {
    console.log(err);
    res.redirect("/login");
  })
});
app.get("/signup", (req,res,next)=>{
  res.render("auth/signup");
});

app.post("/signup", (req,res,next)=>{
  const {name, password, confirmPassword, email} = req.body;
  if(password !== password){
    console.log("Passwords dont match");
    return res.redirect("/signup");
  }
  User.findOne({email:email})
  .then(user => {
    if(user){
      console.log("email already taken");
      return res.redirect("/signup");
    }
  }).catch(err => {
    console.log(err);
    res.redirect("/signup");
  });
  bcrypt.hash(password, 12).then(hashedPassword => {
    const user = new User({
      name:name,
      email:email,
      password:hashedPassword,
      posts: []
  
    });
    return user.save();
  }).then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
    res.redirect("/signup");
  });
  
});

app.use("/static", express.static(__dirname + "/public"));

app.get("/", (req,res, next) => {
 
  res.render("index");
});

app.post("/tweet", (req,res,next) => {
  if(!req.session.user){
    res.redirect("/login");
  }
    console.log(req.body.tweet);
    
    console.log(req.session.user._id);
    User.findOne({_id:req.session.user._id})
    .then(user => {
      let post = new Post({
        message:req.body.tweet,
        user:user._id
      });
      return post.save();

    }).then(result =>{
      console.log(result);
      res.redirect("/tweets")
    }).catch(err => {
      console.log(err);
      res.redirect("/");
    })
});

app.get("/logout", (req,res,next)=>{
  req.session.destroy();
  res.redirect('/tweets');
})

app.get("/delete/:index", (req,res,next)=>{
  const id = req.params.index;
  Post.deleteOne({_id:id,user:req.user._id})
  .then(result =>{
    console.log(result);
    res.redirect("/tweets");
  }).catch(err => {
    console.log(err);
    res.status(501).redirect("/tweets");
  });
  
})

app.get("/tweets", (req,res,next) => {
  if(!req.session.user){
   return  res.redirect('/login');
  }
  Post.find({user: req.session.user._id})
  .then(posts => {
    console.log(posts);
    res.render("tweet", {
      tweets: posts
    });
  }).catch(err => {
    console.log(err);
    res.redirect("/");
  })
  
});
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
.then(result => {
  app.listen(3000,  ()=> console.log('server running!'));
})
.catch(err => console.log(err));
