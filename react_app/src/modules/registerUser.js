
const registerUser = (user, page, pageAccessToken) => {
    return new Promise((resolve, reject) => {
        const body = {
            user,
            page,
            pageAccessToken
        }
        fetch("https://richpanel-fblog.herokuapp.com/user", {
            method: "POST",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((resp) => resolve())
            .catch((err) => console.log(err.message))
    })
}

export default registerUser;