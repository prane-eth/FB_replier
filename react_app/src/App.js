import FacebookLogin from 'react-facebook-login';
import './App.css';
import chatPage from './ChatPage.js'
import cookie from 'react-cookies'
import React from 'react';
// import ReactDOM from 'react-dom';


class App extends React.Component {
  constructor(props){
    super(props)
    this.onLogin = this.onLogin.bind(this)
    this.onLogout = this.onLogout.bind(this)
    this.setState = this.setState.bind(this)
    this.state = {
      fbDetails : null
    }
  }
  responseFacebook(response) {
    console.log('Response : ' + response)
    this.setState({ fbDetails: response })
  }
  componentDidMount() {
    let response = cookie.load('fbDetails')
    this.setState({ fbDetails: response })
  }
  onLogin(response) {
    cookie.save('fbDetails', response, { path: '/' })
    this.setState({ fbDetails: response })
  }
  onLogout() {
    cookie.remove('fbDetails', { path: '/' })
    var response = null  // after logout
    this.setState({ fbDetails: response })
  }
  render()  {
    const { fbDetails } = this.state
    console.log(`Access token 1: ${fbDetails}`)

    return (fbDetails) ? chatPage : ( 
      <div className="App">
        <header className="App-header">
          
          <img 
            src="/Richpanel_logo_colored.svg"
            alt="Richpanel logo" width="300"
          />
          <div className="align_left">
            <p> <strong> Hi, we are Richpanel </strong> </p>
            <b> Deliver effortless customer service through Facebook </b>
          </div>
          <br /> <br />
          
          <img src="/connector_image.jpg" width="400" alt="Connector" />
          <br />
          <p id="login_text"> Click to login with Facebook </p>
          {/* <div class="fb-login-button" data-width="300" data-size="large"
            data-button-type="login_with" data-layout="rounded"
            data-auto-logout-link="false" data-use-continue-as="true"
            callback={responseFacebook}
          > </div> */}
    
          <FacebookLogin
            appId="370672534609881"
            autoLoad={true}
            fields="name,email,picture,phone"
            callback={this.responseFacebook} />
    
        </header>
      </div>
    );
  }
}

export default App;
