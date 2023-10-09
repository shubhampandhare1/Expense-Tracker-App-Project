const express = require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoute = require('./routes/premiumFeature');
const passwordRoutes = require('./routes/password');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoute);
app.use('/password', passwordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))
