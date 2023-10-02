const express = require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const User = require('./models/user');
const Expense = require('./models/expense');
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))
