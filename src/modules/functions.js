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
            <div className="conversation"
                style={{backgroundColor: this.props.isSelected ? '#edeeef' : 'white'}}
                onClick={this.props.onClick}
                >
                <div className="convTime">
                    <div className="convDetails">
                        <input className="checkbox" type="checkbox" 
                            defaultChecked={false} />
                        <div className="nameType">
                            <p className="largertext"> {this.props.fullName}  </p>
                            <p className="mediumtext"> {this.props.msgSource}  </p>
                        </div>
                    </div>
                    <p className="lastReply"> {this.props.lastReply}  </p>
                </div>
                <p className="smalltext"> {this.props.text}  </p>
            </div>
        )
    }
}

export class Message extends React.Component {
    render() {
        var isLast = true;  // TODO: set to default false
        var pageMessages = this.props.pageMessages
        var userMessages = this.props.userMessages
        if (this.props.from == 'page')  // if message is from page, place it on right
            var msgSide = 'msgRight'
        else  // if message is not from page, place it on left
            var msgSide = 'msgLeft'
        
        var picSide = msgSide + 'Pic'
        var timeSide = msgSide + 'Time'
        const convertTime = (timestamp) => {
            timestamp = new Date(timestamp)
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ]
            var result = monthNames[timestamp.getMonth()] + ' '
            var date = timestamp.getDate()
            if (date < 10)
                date = '0' + date
            else
                date = '' + date
            result += date + ', '
            result += timestamp.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            return result
        }

        var displayText  // to display time and name below last message
        displayText = this.props.fullName + ' - '
        if (this.props.from == 'page')
            displayText += convertTime(this.props.pageReply)
        else
            displayText += convertTime(this.props.userReply)

        if (isLast)  {   // if this is last message
            return (
                <div className={'msgContainer ' + msgSide}>
                    <img className={'msgPic ' + picSide} src={this.props.profilePic} />
                    <div className={'msg ' + msgSide}>
                        {this.props.message}
                    </div>
                    <div className={'msgTime ' + timeSide}>{displayText}</div>
                </div>
            )
        }
        else {
            return (   // div instead of img. doesnt display pic
                <div className={'msgContainer ' + msgSide}>
                    <div className={'msgPic ' + picSide} src={this.props.profilePic} />
                    <div className={'msg ' + msgSide}>
                        {this.props.message}
                    </div>
                    <div className={'msgTime ' + timeSide}>{displayText}</div>
                </div>
            )
        }
    }
}