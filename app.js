
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const lodash = require("lodash");

mongoose.connect("mongodb://admin-daksh:test123@ac-jpzqyro-shard-00-00.nrp9c9i.mongodb.net:27017,ac-jpzqyro-shard-00-01.nrp9c9i.mongodb.net:27017,ac-jpzqyro-shard-00-02.nrp9c9i.mongodb.net:27017/blogDB?ssl=true&replicaSet=atlas-r80rsz-shard-0&authSource=admin&retryWrites=true");




const homeStartingContent = "Hey everyone! You can use this website as your daily journal by adding blogs to it. This has been created with the aim of documenting one's life. It can be used for various other purposes. We can store valuable information in it. More features will be added to it soon!";
const aboutContent = "Hey everyone! You can use this website as your daily journal by adding blogs to it. This has been created with the aim of documenting one's life. It can be used for various other purposes. We can store valuable information in it. More features will be added to it soon!";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const postSchema = {
  title: String,
  content: String
};

const Blog = mongoose.model("blog",postSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  Blog.find({},function(err,Posts){
    if(err)
    {
      console.log(err);
    }
    else{
         res.render("home", {homeContent: homeStartingContent, Posts : Posts});
    }
  });
});

app.get("/about", function(req,res){
  res.render("about",{aboutContent : aboutContent});
});

app.get("/contact", function(req,res){
  res.render("contact",{contactContent : contactContent});
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose",function(req,res){
  //const chk = lodash.lowerCase(req.body.post);
  const Post = new Blog({
    title: req.body.postTitle,
    content: req.body.post
  });
  Post.save(function(err){
    if(!err){
      res.redirect("/");
    }
  });
});

app.get("/posts/:postName",function(req,res){
 // const chk = lodash.lowerCase(req.params.postName);
  //console.log(chk)
  
  Blog.findOne({title: req.params.postName},function(err,doc){
    if(!err)
    {
      res.render("post",{title: doc.title, content: doc.content});
    }
   });
   /*
    Posts.forEach(function(post){
    const tds = lodash.lowerCase(post.title); 
    if(tds === chk)
    {
      res.render("post",{title: post.title, content: post.content});
    }
  });
  */
});

app.post("/delete",function(req,res){
  //console.log(req.body.postId);
  Blog.findOneAndDelete({_id: req.body.postId},function(err){
    if(err)console.log(err);
  });
  res.redirect("/");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
