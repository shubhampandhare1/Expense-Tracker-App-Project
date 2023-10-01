const User = require('../models/user');

exports.createUser = async (req, res, next) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ Error: 'Bad Parameters' })
        }

        const userExist = await User.findOne({
            where: { email }
        })

        if (userExist) {
            console.log('>>>>>>>>>>User Already Exist<<<<<<<<<<<<<<')
            return res.status(409).json({ error: 'User Already Exists' });
        }

        const newUser = await User.create({
            name: name,
            email: email,
            password: password
        })
        res.status(200).json({ success: true, message: 'Account Created Successfully' });
    }
    catch (err) {
        res.status(500).json({ err })
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userExist = await User.findOne({
            where: { email }
        })

        if (!userExist) {
            res.status(404).json({ success: false, message: 'User Not Found' });
        }
        else {
            const passwordMatch = await User.findOne({
                where: { email, password }
            })
            if (!passwordMatch) {
                res.status(401).json({ error: 'User Not Authorised' });
            }
            else {
                res.json({ success: true, message: 'User Login Successful' });
            }
        }
    } catch (error) {
        console.log('>>>>>>>>>Error at login User<<<<<<<<', error);
    }
}