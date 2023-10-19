const express = require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoute = require('./routes/premiumFeature');
const passwordRoutes = require('./routes/password');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Forgotpassword = require('./models/forgotPassword');
const DownloadedFiles = require('./models/downloadedFiles');

require('dotenv').config();
const app = express();
app.use(cors({
    origin: "*"
}));
app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoute);
app.use('/password', passwordRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, `views/${req.url}`))
})

User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadedFiles);
DownloadedFiles.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))