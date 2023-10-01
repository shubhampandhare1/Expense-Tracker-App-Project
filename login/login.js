async function login(e) {
    try {
        e.preventDefault();
        const user = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('http://localhost:3000/user/login', user);
        // console.log(response.data.success)
        if (response.data.success == true) {
            alert('User Logged In Successfully');
        }
    }
    catch (err) {
        let error = document.getElementById('error');
        error.innerHTML = `<p style="color:red;">Error:${err.response.data.message}</p>`;
        console.log(err)
    }
}