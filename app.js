const express = require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
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
app.use(cors());

app.use(helmet());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log',), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));   //logging all HTTP requests & responses

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

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadedFiles);
DownloadedFiles.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))
