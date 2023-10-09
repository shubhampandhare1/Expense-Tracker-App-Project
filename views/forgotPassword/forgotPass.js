function forgotPass(event){
    event.preventDefault();
    const email = {
        email: event.target.email.value
    }

    axios.post('http://localhost:3000/password/forgotpassword', email)
    .then((response)=>{
        console.log(response);
    })
    .catch(err=>console.log('error at axios.post forgot pass', err))
}