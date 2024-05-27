//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/expenseDatabase");
var totalAmount = 0;
const expenseSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true
    },
});

const userExpense = mongoose.model("UserExpense", expenseSchema);

app.post("/", (req, res) => {
    var amount = Number(req.body.amount);
    var category = req.body.category;
    var item = req.body.item;
    var date = req.body.date;

    if (category === "Income") {
        totalAmount += amount;
    }
    if (category === "Expense") {
        totalAmount -= amount;
    }

    const expenseData = {
        "amount": amount,
        "category": category,
        "item": item,
        "date": date,
        "totalAmount": totalAmount
    }
    
    const expense = userExpense.create(expenseData);
    res.redirect("/expense");
});

app.get("/", function (req, res) {
    userExpense.find().then(function (foundItems) {
        if (foundItems.length !== 0) {
            res.render("table", { listTitle: "All Expenses and Income", totalAmount: totalAmount, newListItems: foundItems });
        } else {
            res.redirect("/");
        }
    })
    res.render("index.html");
});



app.get("/expense", function (req, res) {
    userExpense.find().then(function (foundItems) {
        if (foundItems.length !== 0) {
            res.render("table", { listTitle: "All Expenses and Income", totalAmount: totalAmount, newListItems: foundItems });
        } else {
            res.redirect("/");
        }
    })
});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.delete;
    const expense = await userExpense.findById(checkedItemId);
    if (expense.category === "Expense") {
            totalAmount += expense.amount;
    }else{
        totalAmount -= expense.amount;
    }
    await expense.deleteOne()
    res.redirect("/expense");
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});