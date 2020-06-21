var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-demo");


var user = new mongoose.Schema({
    id: Number,
    firstName: String,
    lastName: String
});

var order = new mongoose.Schema({
    id: Number,
    itemName: String,
    quantity: Number,
    userId: Number
});

var postComment = new mongoose.Schema({
    id: Number,
    commentDetails: String,
    orderId: Number,
    userId: Number
});

var replyComment = new mongoose.Schema({
    id: Number,
    commentDetails: String,
    commentId: Number
});

var PostComment = mongoose.model("PostComment", postComment);

var ReplyComment = mongoose.model("ReplyComment", replyComment);


app.post("/postComment", (req, res) => {
    
    var myData = new PostComment(req.body);
    myData.save()
        .then(item => {
            res.send("Added comment successfully.");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.post("/replyComment", (req, res) => {
    console.log(req.body);
    var myData = new ReplyComment(req.body);
    myData.save()
        .then(item => {
            res.send("Replyed to the comment successfully.");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/getAllComments", (req, response) => {
   
    mongoose.connection.collection('postcomments').aggregate([
        {
            $lookup:
            { 
                
                from: 'replycomments',
                localField: 'id',
                foreignField: 'commentId',
                as: 'replyCommentsDetails'
            }
        },
        { $project: { "_id": 0, "__v": 0, "replyCommentsDetails": { "_id": 0,"__v": 0 } } }
         
  
    ]).toArray(function (err, res) {
        if (err) throw err;
          
           response.end(JSON.stringify(res));
     
    });
   
});


app.listen(port, () => {
    console.log("Server listening on port " + port);
});