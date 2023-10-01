window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await axios.get('http://localhost:3000/expense/get-expense');

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

        const response = await axios.post('http://localhost:3000/expense/add-expense', expense);
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

    deleteBtn.onclick = async () =>{
        const id = expense.id;

        await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`)
        expenses.removeChild(expenseAdd);
    }

    expenses.appendChild(expenseAdd);
    expenseAdd.appendChild(deleteBtn);
}