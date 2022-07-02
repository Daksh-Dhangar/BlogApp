
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//mongodb://localhost:27017/todolistDB  --- local database connection
// ?retryWrites=true&w=majority/
///?ssl=true&replicaSet=atlas-r80rsz-shard-0&authSource=admin&retryWrites=true&w=majority
mongoose.connect("mongodb://admin-daksh:test123@ac-jpzqyro-shard-00-00.nrp9c9i.mongodb.net:27017,ac-jpzqyro-shard-00-01.nrp9c9i.mongodb.net:27017,ac-jpzqyro-shard-00-02.nrp9c9i.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-r80rsz-shard-0&authSource=admin&retryWrites=true");

const itemsSchema = {
  name: String
};
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Dancing in the Rain."
});

const item2 = new Item({
  name: "Playing cricket in the sun."
});

const item3 = new Item({
  name: "Studying in the cold winter."
});

const defaultItems = [item1, item2, item3];
/*
Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Successfully inserted multiple items to our database.");
  }
});
*/
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("list", listSchema);


app.get("/", function (req, res) {


  Item.find({}, function (err, result) {
    if (result.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully inserted multiple items to our database.");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;
  const NewPlay = new Item({
    name: item
  });
  /*
  Item.insertMany([NewPlay],function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully inserted multiple items to our database.");
    }
  });
  */
  // or you can use NewPlay.save();
  if (listName === "Today") {

    NewPlay.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, function (err, FoundList) {
      if (err) {
        console.log(err);
      }
      else {
        FoundList.items.push(NewPlay);
        FoundList.save();
        res.redirect(`/${listName}`);
      }
    });
  }
});


app.get("/:type", function (req, res) {
  //console.log(req.params.type);

  const customList = _.capitalize(req.params.type);
  List.find({ name: customList }, function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      if (result.length === 0) {
        console.log("does not exist");

        const list = new List({
          name: customList,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${customList}`);
      }
      else {
        // console.log("already exists");
        res.render("list", { listTitle: customList, newListItems: result[0].items });
      }
    }
  });
});

/*
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});
*/
app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  //console.log(req.body);

  /*
   Item.find({_id: req.body.delItem}, function(err,result){
     if(err){
       console.log(err);
     }
     else{
      // console.log(result);
      Item.deleteMany({_id: req.body.delItem}, function(err){
       if(err){
       console.log(err);
       }
       else{
         res.redirect("/");
       }
      });
     }
   });*/
  const delItem = Item.findById(req.body.delItem);
  const listName = req.body.listName;
  if (listName === "Today") {

    Item.findByIdAndDelete(req.body.delItem, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/")
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: req.body.delItem}}},function(err,foundList){
      if(!err)
      {
        res.redirect(`/${listName}`);
      }
    });
  }
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully.");
});
