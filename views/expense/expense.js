const token = localStorage.getItem('token');

//show premium user badge on screen
function showPremiumUser() {
    const premiumText = document.createElement('h4');
    premiumText.innerText = 'Premium User';
    premiumText.style.color = 'green';
    document.getElementById('isPremium').append(premiumText);
    document.getElementById('rzp-button1').style.display = 'none';
}

//funtion to parse JWT token
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
        const page = 1;

        const response = await axios.get(`http://localhost:3000/expense/get-expense?page=${page}`, { headers: { 'Authorization': token } })

        let expArr = response.data.expenses;
        expArr.forEach((exp) => {
            showExpenseInTable(exp);
        })
        showPagination(response.data);

        const decodeToken = parseJwt(token);

        if (decodeToken.ispremiumuser) {
            showPremiumUser();  //premium feature
            showleaderboard();  //premium feature
        }
        //shows list of reecntly downloaded expense files
        recentdownload();

    } catch (error) {
        showError(error);
    }
})

function showPagination(pageData) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (pageData.hasPrevPage) {
        const btn3 = document.createElement('button');
        btn3.innerHTML = `${pageData.prevPage}`;
        btn3.addEventListener('click', () => getExpenses(pageData.prevPage))
        pagination.appendChild(btn3);
    }
    const btn1 = document.createElement('button');
    btn1.innerHTML = `${pageData.currPage}`;
    btn1.addEventListener('click', () => getExpenses(pageData.currPage))
    pagination.appendChild(btn1);

    if (pageData.hasNextPage) {
        const btn2 = document.createElement('button');
        btn2.innerHTML = `${pageData.nextPage}`;
        btn2.addEventListener('click', () => getExpenses(pageData.nextPage))
        pagination.appendChild(btn2);
    }
}

//show expenses on particular page that user clicks
async function getExpenses(page) {
    try {
        const response = await axios.get(`http://localhost:3000/expense/get-expense?page=${page}`, { headers: { "Authorization": token } })

        const expArr = response.data.expenses;
        document.getElementById('tbody').innerHTML = '';
        expArr.forEach((exp) => {
            showExpenseInTable(exp)
        })
        showPagination(response.data);
    } catch (error) {
        showError(error)
    }
}

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


//Buy Premium Button feature + Razorpay
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


function showleaderboard() {
    const premiumFeature = document.getElementById('isPremium');
    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.innerText = 'Show Leaderboard';
    premiumFeature.appendChild(leaderboardBtn)
    leaderboardBtn.onclick = async () => {
        try {
            const response = await axios.get('http://localhost:3000/premium/showleaderboard', { headers: { 'Authorization': token } });

            const leaderboardList = document.getElementById('leaderboard');
            leaderboardList.innerHTML = '<h3>Leaderboard</h3>';
            response.data.forEach((userDeatails) => {
                let leaderboardEle = document.createElement('li');
                leaderboardEle.innerText = `Name- ${userDeatails.name} | Total Expense- ${userDeatails.totalExpense}`;
                leaderboardList.appendChild(leaderboardEle);
            })
        } catch (error) {
            showError(error)
        }
    }
}

//download expense file
async function download() {
    try {
        const response = await axios.get('http://localhost:3000/expense/download', { headers: { "Authorization": token } })

        if (response.status == 200) {
            let a = document.createElement('a');
            a.href = response.data.url;
            a.download = 'myexpenses.csv';
            a.click();
        }
        else {
            throw new Error(response.message);
        }
    } catch (err) {
        showError(err);
    }
}

//show recently downloaded expense files
async function recentdownload() {
    try {
        const response = await axios.get('http://localhost:3000/expense/recentdownload', { headers: { "Authorization": token } })
        let recentdownloads = document.getElementById('recentdownloads');
        response.data.forEach((data) => {
            let file = document.createElement('li');
            file.innerHTML = `<a href="${data.fileUrl}">Downloaded On ${data.date}  </a>`;
            recentdownloads.appendChild(file);
        })
    } catch (err) {
        showError(err);
    }
}

function showError(err) {
    document.getElementById('error').innerHTML = `<div style="color:Red;">${err}</div>`
}