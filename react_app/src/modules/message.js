import React from 'react';
import './message.css';

const Message = (props) => {
    return (
        <div className="mainWrapperMessage" style={{
            alignSelf: props.align === "left" ? 'flex-start' : 'flex-end',
            flexDirection: props.align === "left" ? "row" : "row-reverse",
        }}>
            <img src={props.icon} alt="user-icon" className="messageUserIcon" />
            <div className="messageContainer">
                <p>
                    {props.message}
                </p>
            </div>
        </div>
    )
};

Message.defaultProps = {
    message: 'This is default message!',
    align: 'right',
    icon: 'https://picsum.photos/200/200',
    date: Date.now(),
}

export default Message;