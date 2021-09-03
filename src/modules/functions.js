import axios from "axios";
import React from "react";
import './functions.css';

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

export async function loadPath(path, pageToken) {
    var url = `https://graph.facebook.com/${path}?access_token=${pageToken}`
    var response = await axios.get(url);
    return response;
}

export function getURL(path, pageToken)   {
    var url = `https://graph.facebook.com/${path}?access_token=${pageToken}`
    return url
}

export class Conversation extends React.Component {
    render()    {
        return (
            <div 
                className="mainWrapperConv"
                style={{
                    backgroundColor: this.props.isSelected ? '#edeeef' : 'white',
                    borderBottom: '#E5E5E5',
                    borderBottomWidth: 1,
                }}
                onClick={this.props.onClick}
                >
                <div className="convInnerContainer">
                    <input className="checkbox" type="checkbox" 
                        defaultChecked={false} />
                    <div className="convInnerContainerDetails">
                        <p className="largertext"> {this.props.name}  </p>
                        <p className="mediumtext"> {this.props.type}  </p>
                        <p className="smalltext"> {this.props.text}  </p>
                        <p className="lastReply"> {this.props.lastReply}  </p>
                    </div>
                </div>
            </div>
        )
    }
}

export class Message extends React.Component {
    render() {
        if (this.props.from == 'page')  {
            return (
                <div className="msg msgRight">
                    {this.props.message}
                </div>
            )
        }
        else    {
            return (
                <div className="msg msgLeft">
                    {this.props.message}
                </div>
            )
        }
    }
}