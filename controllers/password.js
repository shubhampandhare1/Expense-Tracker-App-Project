const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const Forgotpassword = require('../models/forgotPassword');
const { UUIDV4 } = require('sequelize');
exports.forgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({ where: { email: email } })

        if (user) {
            const id = uuid.v4();

            user.createForgotpassword({ id, isActive: true })
                .then(res => console.log('create forgotPassword completed'))
                .catch(err => {
                    throw new Error(err)
                })

            const client = Sib.ApiClient.instance;
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.SIB_API_KEY;
            const tranEmailApi = new Sib.TransactionalEmailsApi();

            const sender = {
                email: 'sde.shubham1997@gmail.com',
                name: 'Shubham @ Expense Tarcker App'
            }

            const receivers = [{
                email: req.body.email
            }]

            tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Reset Password',
                htmlContent: `<h2>Reset Password</h2>
                <a href='http://16.16.184.66:3000/password/resetpassword/${id}'>Click Here</a> to reset password`
            })
                .then((result) => {
                    // console.log(result)
                    res.status(202).json({ success: true, message: 'Reset Password Link sent successfully' });
                })
                .catch((err) => {
                    console.error('SendinBlue Error:', err.response ? err.response.body : err.message);
                    throw new Error(err);
                })
        } else {
            throw new Error("User doesn't exist");
        }
    } catch (err) {
        res.json({ message: 'User Not Found', success: false })
    }
}

exports.resetpassword = async (req, res, next) => {
    try {
        const id = req.params.id;

        const forgotPassReq = await Forgotpassword.findOne({ where: { id: id } })
        if (forgotPassReq.isActive) {
            forgotPassReq.update({ isActive: false })
            const filePath = path.join(__dirname, '../views/forgotPassword/resetpassword.html')
            const htmlContent = fs.readFileSync(filePath, 'utf-8');

            const finalHtmlContent = htmlContent.replace('<%= id %>', id);

            res.status(200).send(finalHtmlContent);
        }
        else {
            console.log('isActive ===== false')
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: 'reset password controller failed' })
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const resetid = req.params.id;
        const newPassword = req.body.newPassword;
        const resetPassReq = await Forgotpassword.findOne({ where: { id: resetid } })
        const user = await User.findOne({ where: { id: resetPassReq.userId } })
        if (user) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await user.update({ password: hashedPassword });
            return res.status(201).json({ message: 'Password updated Successfully', success: true })
        } else {
            return res.status(404).json({ message: 'user not found' })
        }
    } catch (error) {
        return res.json({ err: error, success: false })
    }
}