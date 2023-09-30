const express = require('express');
const Sequelize = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

const sequelize = new Sequelize('expense-tracker-app', 'root', 'Shubham@9767',
    {
        dialect: 'mysql',
        host: 'localhost',
    })

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

app.post('/user/signup', async (req, res, next) => {
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const userExist = await User.findOne({
            where:{email}
        })

        if(userExist){
            console.log('>>>>>>>>>>User Already Exist<<<<<<<<<<<<<<')
            return res.status(400).json({error:'User Already Exists'});
        }
    
        const newUser = await User.create({
            name:name,
            email:email,
            password:password
        })
        res.status(200).json({newUser});
    }
    catch(err){
        res.status(500).json({err})
    }
})

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))
