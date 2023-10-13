const token = localStorage.getItem('token');
function showPremiumUser() {
    const premiumText = document.createElement('h4');
    premiumText.innerText = 'Premium User';
    premiumText.style.color = 'green';
    document.getElementById('isPremium').append(premiumText);
    document.getElementById('rzp-button1').style.display = 'none';
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async () => {
    try {

        const decodeToken = parseJwt(token);
        // console.log(decodeToken);
        if (decodeToken.ispremiumuser) {
            showPremiumUser();
            showleaderboard();
        }
        const response = await axios.get('http://localhost:3000/expense/get-expense', { headers: { "Authorization": token } });

        const expenses = response.data.expenses;

        expenses.forEach(expense => {
            showExpenseInTable(expense);
        })
        recentdownload();

    } catch (error) {
        showError(error);
    }
})

//To add expenses for the user
async function addExpense(event) {
    try {
        event.preventDefault();
        let today = new Date().toJSON().slice(0, 10);
        const expense = {
            amount: event.target.amount.value,
            description: event.target.description.value,
            category: event.target.category.value,
            date: today,
        }

        const response = await axios.post('http://localhost:3000/expense/add-expense', expense, { headers: { "Authorization": token } });
        // showOnScreen(response.data.newExpense);
        showExpenseInTable(response.data.newExpense);

    } catch (error) {
        showError(error)
    }
}

function showExpenseInTable(expense) {
    let tr = document.createElement('tr');
    let td1 = tr.appendChild(document.createElement('td'));
    let td2 = tr.appendChild(document.createElement('td'));
    let td3 = tr.appendChild(document.createElement('td'));
    let td4 = tr.appendChild(document.createElement('td'));

    td1.innerHTML = expense.date;
    td2.innerHTML = expense.amount;
    td3.innerHTML = expense.description;
    td4.innerHTML = expense.category;

    //delete button
    let td5 = document.createElement('button');
    td5.innerText = 'Delete Expense';
    td5.onclick = async () => {
        try {
            const id = expense.id;

            await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`, { headers: { "Authorization": token } })
            document.getElementById('tbody').removeChild(tr);
        } catch (error) {
            showError(error);
        }
    }

    tr.appendChild(td5);
    document.getElementById('tbody').appendChild(tr);
}

//to show expenses of the user on UI
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

//Buy Premium Button feature
document.getElementById('rzp-button1').onclick = async (event) => {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

    let options = {
        "key": response.data.key_id,    //Enter the KeyId generated from dahsboard
        "order_id": response.data.order.orderid,    //For one time payment
        //This handler function will handle the success payment
        "handler": async function (response) {
            const res = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                orderid: options.order_id,
                paymentid: response.razorpay_payment_id,
            }, { headers: { "Authorization": token } })
            alert('You are Premium User Now!');
            localStorage.setItem('token', res.data.token);
            showPremiumUser();
            showleaderboard();
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

//Show premium user badge on UI
// const showPremiumUser = async () => {
//     try {
//       
//         const response = await axios.get('http://localhost:3000/purchase/ispremium', { headers: { "Authorization": token } })
//         // console.log(response);
//         if (response.data.user.isPremiumUser == true) {
//             const premiumText = document.createElement('h4');
//             premiumText.innerText = 'Premium User';
//             premiumText.style.color = 'green';
//             document.getElementById('isPremium').append(premiumText);
//             document.getElementById('rzp-button1').style.display = 'none';
//             // document.getElementById('lb-button').style.display = 'block';
//             showleaderboard();
//         }
//         else {
//             document.getElementById('rzp-button1').style.display = 'block';
//         }
//     }
//     catch (err) {
//         console.log('error at showPremiumUser', err)
//     }
// }

function showleaderboard() {
    const premiumFeature = document.getElementById('isPremium');
    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.innerText = 'Show Leaderboard';
    premiumFeature.appendChild(leaderboardBtn)
    leaderboardBtn.onclick = async () => {

        const response = await axios.get('http://localhost:3000/premium/showleaderboard', { headers: { 'Authorization': token } });
        // console.log(response)
        const leaderboardList = document.getElementById('leaderboard');
        leaderboardList.innerHTML = '<h3>Leaderboard</h3>';
        response.data.forEach((userDeatails) => {
            let leaderboardEle = document.createElement('li');
            leaderboardEle.innerText = `Name- ${userDeatails.name} | Total Expense- ${userDeatails.totalExpense}`;
            leaderboardList.appendChild(leaderboardEle);
        })
    }
}

function download() {
    axios.get('http://localhost:3000/expense/download', { headers: { "Authorization": token } })
        .then((response) => {
            if (response.status == 200) {
                let a = document.createElement('a');
                a.href = response.data.url;
                a.download = 'myexpenses.csv';
                a.click();
            }
            else {
                throw new Error(response.message);
            }
        })
        .catch(err => {
            showError(err);
        })
}

function recentdownload() {
    axios.get('http://localhost:3000/expense/recentdownload', { headers: { "Authorization": token } })
        .then((response) => {
            let recentdownloads = document.getElementById('recentdownloads');
            response.data.forEach((data) => {
                let file = document.createElement('li');
                file.innerHTML = `<a href="${data.fileUrl}">Downloaded On ${data.date}  </a>`;
                recentdownloads.appendChild(file);
            })
        })
        .catch(err => console.log(err));
}

function showError(err) {
    document.getElementById('error').innerHTML = `<div style="color:Red;">${err}</div>`
}