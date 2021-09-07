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

        var userLast = 0, pageLast = 0
        this.props.messages.map((item, index) => {
            if (item.from == 'page')
                pageLast = index;
            else
                userLast = index;
        })

        if (this.props.from == 'page'){
            // to display time and name below last message
            var displayText = this.props.pageName + ' - ' + convertTime(this.props.pageReply)
            var msgSide = 'msgRight'  // if message is from page, place it on right  
            var isLast = (this.props.index == pageLast)
            var profilePic = this.props.pageProfilePic
        } else {
            var displayText = this.props.fullName + ' - '  + convertTime(this.props.userReply)
            var msgSide = 'msgLeft'  // if message is from user, place it on left
            var isLast = (this.props.index == userLast)
            var profilePic = this.props.userProfilePic
        }
        
        var picSide = msgSide + 'Pic'
        var timeSide = msgSide + 'Time'
        var containerSide = msgSide + 'Container'

        if (isLast)  {   // if this is last message
            return (
                <div className={containerSide}>
                    <img className={picSide} src={profilePic} />
                    <div className={'msg ' + msgSide}>
                        {this.props.message}
                    </div>
                    <div className={timeSide}>{displayText}</div>
                </div>
            )
        }
        else {
            return (   // div instead of img. doesnt display pic
                <div className={containerSide}>
                    {/* dont display any image */}
                    <div className={picSide} src={this.props.profilePic} />
                    <div className={'msg ' + msgSide}>
                        {this.props.message}
                    </div>
                    <div className={timeSide}> </div>
                    {/* dont display any text */}
                </div>
            )
        }
    }
}