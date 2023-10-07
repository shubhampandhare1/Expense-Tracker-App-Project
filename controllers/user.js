const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ Error: 'All fields are required' })
        }

        const userExist = await User.findOne({
            where: { email }
        })

        if (userExist) {
            // console.log('>>>>>>>>>>User Already Exist<<<<<<<<<<<<<<')
            return res.status(409).json({ error: 'User Already Exists' });
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            if (err) {
                console.log('error at bcrypt.hash', err);
            }
            const newUser = await User.create({
                name: name,
                email: email,
                password: hash,
            })
            res.status(201).json({ success: true, message: 'Account Created Successfully' });
        })
    }
    catch (err) {
        res.status(500).json({ err })
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userExist = await User.findAll({
            where: { email }
        })

        if (userExist.length > 0) {
            bcrypt.compare(password, userExist[0].password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong!');
                }
                if (result === true) {
                    res.status(200).json({ success: true, message: 'User Login Successful', token: generateAccessToken(userExist[0].id) });
                }
                else {
                    return res.status(401).json({ error: 'Password is incorrect' });
                }
            })
        }
        else {
            return res.status(404).json({ success: false, message: 'User Not Found' });
        }
    } catch (error) {
        console.log('>>>>>>>>>Error at login User<<<<<<<<', error);
    }
}

function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.SECRET_KEY);
}