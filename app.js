//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-mahima:Maahi123@cluster0.2zpav7n.mongodb.net/todolistDB');

}

const itemSchema = mongoose.Schema({
  name:  String,
});

const listSchema = mongoose.Schema({
  name: String,
  item: [itemSchema]
})

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema)

const item1 = new Item({
  name:"Learn MERN"
});

const item2 = new Item({
  name:"Apply for jobs"
})

const item3 = new Item({
  name:"Walk"
})


const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {


  Item.find().then(function(items){
    if(items.length === 0){
      Item.insertMany(defaultItems);
    }else{
      res.render("list", {listTitle: "Today", newListItems: items}); // Success
    }
  }).catch(function(error){
    console.log(error)      // Failure
  });
  

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      const listItem = new List({
        name: customListName,
        item: defaultItems
      });
    
      listItem.save();
      res.redirect("/"+customListName);
    }else{
        //display the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item}); // Success
      }
  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemNew = new Item({
    name: itemName,
  })

  if(listName === "Today"){
    itemNew.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.item.push(itemNew);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});


app.post("/delete", function(req, res){ 
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
        console.log("Succesfully deleted checked item from the database");
        res.redirect("/");
    })
    .catch((err) => {
        console.log(err);
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName);
    })
  }
 
 
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT | 3000, function() {
  console.log("Server started on port 3000");
});
