async function login(e) {
    try {
        e.preventDefault();
        const user = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('http://localhost:3000/user/login', user);
        console.log(response.data.token)
        if (response.data.success == true) {
            localStorage.setItem('token',response.data.token);
            alert(response.data.message);
            window.location.href = '../expense/expense.html';
        }
    }
    catch (err) {
        let error = document.getElementById('error');
        error.innerHTML = `<p style="color:red;">Error:${err.message}</p>`;
        console.log(err)
    }
}