

const pageCode = ( 
    <div className="App">
      <header className="App-header">
        
        
  
      </header>
    </div>
);

const chatPage = () => {
    const { fbDetails } = this.state
    console.log(`Access token 1: ${fbDetails}`)

    return (fbDetails) ? pageCode : window.location.href = '/';
}
export default chatPage;