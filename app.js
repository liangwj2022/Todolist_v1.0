//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

mongoose.connect("mongodb+srv://liangw27:legend31015789@start.hh8oi.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
})

const item2 = new Item({
  name: "Cook Food"
})

const item3 = new Item({
  name: "Eat Food"
})

const defaultItems = [item1, item2, item3];
//Item.insertMany(defaultItems, (err)=>{});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  //const day = date.getDate();
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {});
      res.redirect("/");
    }
    else{
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, (err) => {});
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemID}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Show an existing list

      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }

  });


  // res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port" + port);
});
