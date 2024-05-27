//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const dotenv  = require("dotenv");

dotenv.config({
  path:"Config/config.env",
});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

mongoose.connect(process.env.DB_URI);
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

app.post("/", async(req, res) => {
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

    await userExpense.create(expenseData);
    res.redirect("/expense");
});

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    const expense = await userExpense.findById(id);
    res.render("edit" ,{ editTitle : "Update" , newListItem:expense });
});

app.post("/edit/:id", async (req, res) => {
    const updatedAmount = Number(req.body.updatedAmount);
    const updatedItem = req.body.updatedItem;
    const updatedCategory = req.body.updatedCategory;
    const updatedDate = req.body.updatedDate;
    const expense = await userExpense.findById(req.params.id);

    if (updatedAmount) {

        if (updatedCategory === "Income") {
            if (updatedCategory === "Income" && updatedCategory === expense.category) {
                totalAmount = totalAmount - expense.amount + updatedAmount;
            } else {
                totalAmount = totalAmount + expense.amount + updatedAmount;
            }
        }

        if (updatedCategory === "Expense") {
            if (updatedCategory === "Expense" && updatedCategory === expense.category) {
                totalAmount = totalAmount + expense.amount - updatedAmount;
            } else {
                totalAmount = totalAmount - expense.amount - updatedAmount;
            }
        }
        expense.amount = updatedAmount;
    }
    if (updatedCategory) {
        expense.category = updatedCategory;
    }
    if (updatedItem) {
        expense.item = updatedItem;
    }
    if (updatedDate) {
        expense.date = updatedDate;
    }
    await expense.save();
    res.redirect("/expense");

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
    } else {
        totalAmount -= expense.amount;
    }
    await expense.deleteOne()
    res.redirect("/expense");
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port : ${process.env.PORT}`);
});