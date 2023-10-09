const Sib = require('sib-api-v3-sdk');

exports.forgotPassword = async (req, res, next) => {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.API_KEY;
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
        <p><a href='google.com'>Click Here</a> to reset password</p>`
    })
        .then((result) => {
            console.log(result)
            res.status(202).json({ success: true, message: 'Reset Password Link sent successfully' });
        })
        .catch((err) => {
            console.error('Error:', err.response, err.response.data, err.message);
            res.status(500).json(err);
        })

}