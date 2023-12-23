const Razorpay = require('razorpay');
const Order = require('../models/order');
const userController = require('./user');

exports.purchasePremium = async (req, res, next) => {
    try {
        let rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const amount = 1000;
        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            try {
                const createOrder = await req.user.createOrder({ orderid: order.id, status: 'PENDING' })
                return res.status(201).json({ order: createOrder, key_id: rzp.key_id })
            }
            catch (err) {
                throw new Error(err);
            }
        })
    } catch (error) {
        console.log('err at purchasePremium controller>>>>', error);
        res.status(403).json({ message: 'Something went wrong', err: error });
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    const orderid = req.body.orderid;
    const paymentid = req.body.paymentid;
    if (paymentid != 'payment_failed') {
        try {
            const p1 = Order.findOne({ where: { orderid: orderid } }).then(async (order) => {
                order.update({ paymentid: paymentid, status: 'SUCCESSFUL' })
            })
            const p2 = req.user.update({ isPremiumUser: true });

            await Promise.all([p1, p2]);

            return res.status(202).json({ success: true, message: 'Transaction Succesful', token: userController.generateAccessToken(req.user.id, true) })
        }
        catch (err) {
            res.status(403).json({ message: 'Payment Successful' });
        }
    }
    else {
        try {
            const p1 = Order.findOne({ where: { orderid: orderid } }).then(async (order) => {
                await order.update({ paymentid: paymentid, status: 'FAILED' })
            })
            const p2 = req.user.update({ isPremiumUser: false })

            await Promise.all([p1, p2])

            return res.status(202).json({ success: true, message: 'Transaction Failed' })
        }
        catch (err) {
            res.status(403).json({ message: 'Payment Failed' });
        }
    }
}