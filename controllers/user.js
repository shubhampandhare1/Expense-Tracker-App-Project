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
            return res.status(400).json({ error: 'User Already Exists' });
        }

        const newUser = await User.create({
            name: name,
            email: email,
            password: password
        })
        res.status(200).json({ newUser });
    }
    catch (err) {
        res.status(500).json({ err })
    }
}