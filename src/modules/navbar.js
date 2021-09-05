import React from 'react';
import { Redirect } from 'react-router-dom';
import cookie from 'react-cookies'
import './navbar.css'

// https://react-icons.github.io/react-icons
import { MdPeople } from "react-icons/md";
import { BsInboxFill } from "react-icons/bs"
import { FiLogOut } from 'react-icons/fi'
import { VscGraph } from 'react-icons/vsc'


const fbDetails = cookie.load('fbDetails');
var profilePicLink = null;

if (fbDetails) 
    profilePicLink = fbDetails['picture']['data']['url'];

const Navbar = () => {
    return (
        <div className="mainWrapperNav">
            <div className="navItem" onClick={<Redirect to="/" />}>
                <img className="navItemLogo" src="/InvertedIcon.png"
                    alt="Richpanel logo" width="50" />
            </div>
            <div className="navItem navItemSelected">
                <BsInboxFill color="rgb(0,  78, 150)"/>
            </div>
            <div className="navItem" onClick={() => alert('No such option')}>
                <MdPeople color="white"/>
            </div>
            <div className="navItem" onClick={() => alert('No such option')}>
                <VscGraph color="white"/>
            </div>
            <div className="navItem" onClick={() => window.document.location="/logout"}>
                <FiLogOut color="white"/>
            </div>
            
            <div className="navItem navProfile">
                <img className="navProfileIcon" 
                    src={profilePicLink}
                    alt="Profile pic" />
            </div>
        </div>
    )
};

export default Navbar;