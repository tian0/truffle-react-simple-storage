import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storageValue: 0,
      web3: null,
      contract: null,
      account: null
    }
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    //declaring this for later so we can chain functions on SimpleStorage
    var SimpleStorageInstance
    simpleStorage.deployed().then((instance) => {
      SimpleStorageInstance = instance
      return instance

    })
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  handleClick(event) {
    this.instantiateContract()
    const { accounts, contract } = this.state;

    var value = 3
    contract.methods.set(value).send({ from: accounts[0] })
    .then(result => {
      return contract.methods.get().call()
    }).then(result => {
      return this.setState({ storageValue: result })
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready</p>
              <h2>Smart Contact Example - Simple Storage</h2>
              <p>If contract compiled and migrated successfully, below will show a stored value of 5 (default)</p>
              <p>Try changing the value stored on line 59 of App.js</p>
              <p>The stored value is: {this.state.storageValue}</p>
              <button onClick={this.handleClick.bind(this)}>Set Storage</button>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App;
