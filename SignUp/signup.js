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
        console.log('User Created',response);

    } catch (err) {
        console.log('error at axios post', err);
    }
}