function forgotPass(event) {
    event.preventDefault();
    const email = {
        email: event.target.email.value
    }

    axios.post('http://localhost:3000/password/forgotpassword', email)
        .then((response) => {
            if (response.data.success == true){
                alert(response.data.message);
            }
    })
        .catch(err => console.log('error at axios.post forgot pass', err))
}