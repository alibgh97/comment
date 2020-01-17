var express = require("express") ;
var bodyParser = require("body-parser") ;
var app = express() ;
var morgan = require('morgan') ;
var session = require('express-session') ;
var mongoose = require('mongoose') ;

const db = require('http').Server(app);
// var db = mongoose.connect('mongodb://localhost/myapp');
var userSchema = new mongoose.Schema({
    email : String ,
    username : String ,
    password : String
}) ;
var commentSchema = new mongoose.Schema({
    user : String ,
    text : String ,
    like : Number
}) ;

var userModel = mongoose.model("User" , userSchema ) ;
var commentMondel = mongoose.model("comment", commentSchema) ;

db.on('error' , function () {
    console.log("oh oh .. :(")
}) ;
db.once("connected" , function () {
    console.log("MongoDb Connected") ;
}) ;

app.use(morgan('common')) ;
app.use(express.static(__dirname + "/static")) ;
app.use(bodyParser.json()) ;
app.use(bodyParser.urlencoded({ extended:true })) ;
app.use(session({
    secret : "secret",
    resave : false,
    saveUninitialized : true
})) ;


app.get("/" , function (req, resp, next) {
    console.log(req.session) ;
    resp.sendFile(__dirname + "/static/home.html") ;
}) ;

app.get("/login" , function (req, resp, next) {
    resp.sendFile(__dirname + "/static/login.html") ;
}) ;

app.post("/getInfo"  , function (req, resp, next) {
    resp.json(req.session.auth) ;
}) ;

app.post("/login" , function (req, resp, next) {
    if (req.session.auth != undefined) {
        resp.json({status : false , msg : "to ke login budi !"}) ;
    }
    else {
        userModel.findOne({ username: req.body.username }, function (err, user) {
            if (err) {
                throw err
            }
            if (user != undefined) {
                if (user.password == req.body.password) {
                    req.session.auth = { username: req.body['username'] };
                    resp.json({status: "true", msg: "login shodi !"});
                    console.log(req.session);
                }
                else {
                    resp.json({status: "false", msg: "password qalat"});
                }
            }
            else {
                resp.json({status: "false", msg: "user yaft nashod"});
            }
        })
    }

}) ;

app.post("/logout" , function (req, resp, next) {
//    delete req.session.auth ;
    req.session.auth = {} ;
    resp.json({status : true , msg : "gomsho biroon az site :|"}) ;
}) ;


app.post("/signup" , function (req, resp, next) {
    var formData = req.body ;
    if ( formData.username.length && formData.password.length ) {
        if ( formData.password.length >= 4 ) {
            userModel.find({username : formData.username} , function (err, users) {
                if (err ) { throw err}
                else if ( users.length ) {
                    resp.json({status : false , msg : "usere tekrari !  :( " })
                }
                else {
                    var newUser = new userModel({
                        email : formData.email || " " ,
                        password : formData.password ,
                        username : formData.username
                    }) ;
                    console.log(newUser) ;
                    newUser.save() ;
                    resp.json({status : true , msg : "afarin  "}) ;
                 }
            })
        }
        else {
            resp.json({status : false , msg : "password bayad 4 ta bashe ya bishtar ! "} ) ;
        }
    }
    else {
        resp.json({status : false , msg : "username ya passowrd nadari ! :| "}) ;
    }

}) ;

app.post("/submitComment" , function (req, resp, next) {
    if ( req.session.auth.username != undefined ) {
        commentMondel.create({
            user : req.session.auth.username ,
            text : req.body.msg ,
            like : 0
        }, function (err, commnet) {
            if (err ) {throw err}
            console.log(commnet) ;
        }) ;
    }
    else {
        resp.json({status : false , msg : "to ke login nisti !"}) ;
    }



}) ;

app.post("/getComment" , function (req, resp, next) {
    commentMondel.find({} , function (err, comments) {
        if (err) {throw err}
        else {
            resp.json(comments);
        }
    })
}) ;

app.listen(8000) ;
console.log("app running on port 8000") ;
