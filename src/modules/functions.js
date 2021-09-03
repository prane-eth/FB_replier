import axios from "axios";
import React from "react";
import './functions.css';

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
                className="convContainer"
                style={{
                    backgroundColor: this.props.isSelected ? '#edeeef' : 'white',
                    borderBottom: '#E5E5E5',
                    borderBottomWidth: 1,
                }}
                onClick={this.props.onClick}
                >
                <div className="msgDetailsContainer">
                    <input className="checkbox" type="checkbox" 
                        defaultChecked={false} />
                    <div className="nameTypeContainer">
                        <p className="lastReply"> {this.props.lastReply}  </p>
                        <p className="largertext"> {this.props.name}  </p>
                        <p className="mediumtext"> {this.props.type}  </p>
                    </div>
                    <p className="smalltext"> {this.props.text}  </p>
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