const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

app.get("/", (req,res, next) => {
  res.render("index");
});
const getTime = () => {
  const date = new Date();
  return date.toLocaleTimeString() + " - " + date.toDateString();
}
app.post("/tweet", (req,res,next) => {
    console.log(req.body.tweet);
    let tweet = {
      message: req.body.tweet,
      time: getTime()
    }
    
    fs.readFile("./data/tweets.json", (err,data)=>{
      if(err){
        return res.status(502).redirect("");
      }
      tweets = JSON.parse(data);
      tweets.push(tweet);
      fs.writeFile("./data/tweets.json", JSON.stringify(tweets), (err) =>{
        if(err){
          return res.status(501).redirect("/");
        }
        console.log("success");
        res.redirect("/tweets");
      });
    });
});

app.get("/delete/:index", (req,res,next)=>{
  const index = req.params.index;
  let tweets = fs.readFileSync("./data/tweets.json", "utf-8");
  tweets = JSON.parse(tweets);
  tweets = tweets.filter((e, i) => {
      return i != index;
  });
  fs.writeFile("./data/tweets.json", JSON.stringify(tweets), (err) =>{
    if(err){
      return res.status(501).redirect("/");
    }
    console.log("success");
    res.redirect("/tweets");
  });
})

app.get("/tweets", (req,res,next) => {
  let tweets = fs.readFileSync("./data/tweets.json", "utf-8");
  tweets = JSON.parse(tweets);
  if(tweets.length < 1 || tweets == undefined){
    tweets = null;
}
  return res.render("tweet", {

        tweets: tweets
      });
});
app.listen(PORT, () => {
  console.log(`Now running on port ${PORT}`);
});
