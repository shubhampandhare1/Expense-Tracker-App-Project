// const Razorpay = require("razorpay");

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/expense/get-expense', { headers: { "Authorization": token } });

        const expenses = response.data.expenses;

        expenses.forEach(expense => {
            showOnScreen(expense);
        })

    } catch (error) {
        console.log('error while fetching data', error);
    }
})

async function addExpense(event) {
    try {
        event.preventDefault();

        const expense = {
            amount: event.target.amount.value,
            description: event.target.description.value,
            category: event.target.category.value
        }
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:3000/expense/add-expense', expense, { headers: { "Authorization": token } });
        showOnScreen(response.data.newExpense);

    } catch (error) {
        console.log(error)
    }
}

function showOnScreen(expense) {

    const expenses = document.getElementById('listOfExpenses');

    let expenseAdd = document.createElement('li');
    expenseAdd.id = 'expenseAdd';

    expenseAdd.innerText = `${expense.amount} | ${expense.description} | ${expense.category}`;

    let deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete Element';

    deleteBtn.onclick = async () => {
        try {
            const id = expense.id;
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`, { headers: { "Authorization": token } })
            expenses.removeChild(expenseAdd);
        } catch (error) {
            let errDiv = document.createElement('div');
            let errorDiv = document.getElementById('error');
            errDiv.innerHTML = `<div style="color:red">Error:${error.message}</div>`;
            errorDiv.appendChild(errDiv);
        }

    }

    expenses.appendChild(expenseAdd);
    expenseAdd.appendChild(deleteBtn);
}

document.getElementById('rzp-button1').onclick = async (event) => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

    let options = {
        "key": response.data.key_id,    //Enter the KeyId generated from dahsboard
        "order_id": response.data.order.orderid,    //For one time payment
        //This handler function will handle the success payment
        "handler": async function (response) {
            await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                orderid: options.order_id,
                paymentid: response.razorpay_payment_id,
            }, { headers: { "Authorization": token } })
            alert('You are Premium User Now!');
        }
    }
    const rzp1 = new Razorpay(options);
    rzp1.open();
    event.preventDefault();
    rzp1.on('payment.failed', function (response) {
        axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            orderid: options.order_id,
            paymentid: response.error.reason,
        }, { headers: { "Authorization": token } })
        alert('Payment Failed => Try Again');
    })
}