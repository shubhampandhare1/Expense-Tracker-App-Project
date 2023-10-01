async function login(e) {
    try {
        e.preventDefault();
        const user = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('http://localhost:3000/user/login', user);
        // console.log(response.data)
        if (response.data.success == true) {
            alert(response.data.message);
        }
    }
    catch (err) {
        let error = document.getElementById('error');
        error.innerHTML = `<p style="color:red;">Error:${err.message}</p>`;
        console.log(err)
    }
}