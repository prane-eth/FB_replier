import axios from "axios";

export const sendMessage = (recipient_psid, sender_psid, message, page_access_token) => {
    return new Promise(async (resolve, reject) => {
        console.log(page_access_token);
        try {
            const body = {
                recipient: recipient_psid,
                sender: sender_psid,
                message,
            };
            fetch("https://rpanel.herokuapp.com/message", {
                method: "post",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                    "Authorization": page_access_token,
                },
                body: JSON.stringify(body),
            })
                .then((resp) => {
                    console.log(resp);
                    resolve();
                })
                .catch((err) => {
                    console.log(err.message);
                    reject(err);
                })
        } catch (err) {

        }
    });
}

export async function loadPath(path, token) {
    var url = `https://graph.facebook.com/${path}?access_token=${token}`
    // var response = await axios.get(url);
    return await axios.get(url);
    // usage: var res = await loadPath('/104870408597057/', token)
}

export function getURL(path, pageToken)   {
    var url = `https://graph.facebook.com/${path}?access_token=${pageToken}`
    return url
}