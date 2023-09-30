async function signup(event) {

    try {
        event.preventDefault();

        const user = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value
        }

        // console.log(user);
        const response = await axios.post('http://localhost:3000/user/signup', user)
        console.log('User Created',response.data.newUser);

    } catch (err) {
        console.log("User Exists",err.response.data.error)
        if(err.response.data.error){
            let errDiv = document.createElement('div');
            let existing = document.getElementById('existing');
            errDiv.innerHTML = '<div style="color:red">User Already Exists</div>';
            existing.appendChild(errDiv);
        }
    }
}