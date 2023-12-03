import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import web3 from './web3';
import ticketSales from './ticketsales';

function App() {
  const [owner, setOwner] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [purchaseTicketId, setPurchaseTicketId] = useState('');
  const [notification, setNotification] = useState('');

  const [offerTicketId, setOfferTicketId] = useState('');
  const [acceptOfferId, setAcceptOfferId] = useState('');
  
  const [userTicketId, setUserTicketId] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {

        const contractOwner = await ticketSales.methods.owner().call();
        setOwner(contractOwner);

        const ticketPrice = await ticketSales.methods.ticketPrice().call();
        setTicketPrice(ticketPrice);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const purchaseTicket = async () => {
    try {
      const ticketId = parseInt(purchaseTicketId);
  
      if (window.ethereum.selectedAddress.toLowerCase() === owner.toLowerCase()) {
        throw new Error('Contract owner cannot buy tickets');
      }
  
      const currentOwner = await ticketSales.methods.getTicketOf(window.ethereum.selectedAddress).call();
      if (currentOwner > 0) {
        throw new Error('You may only purchase one ticket');
      }
  
      const existingOwner = await ticketSales.methods.ticketOwnersByTicketId(ticketId).call();
      if (existingOwner !== '0x0000000000000000000000000000000000000000') {
        throw new Error('Ticket already owned by someone else');
      }
  
      const transactionReceipt = await ticketSales.methods.buyTicket(ticketId).send({
        from: window.ethereum.selectedAddress,
        value: ticketPrice,
      });
  
      if (transactionReceipt.status) {
        setNotification(`Ticket ${ticketId} purchased successfully!`);
      } else {
        setNotification(`Transaction failed. Check the transaction receipt for details.`);
        console.error(transactionReceipt);
      }
    } catch (error) {
      setNotification(`Error purchasing ticket: ${error.message}`);
    }
  };
  
  const offerSwap = async () => {
    try {
      const ticketId = parseInt(offerTicketId);
  
      const currentOwner = await ticketSales.methods.getTicketOf(window.ethereum.selectedAddress).call();
      if (currentOwner <= 0) {
        throw new Error('You do not own a ticket');
      }
  
      const existingOwner = await ticketSales.methods.ticketOwnersByTicketId(ticketId).call();
      if (existingOwner === '0x0000000000000000000000000000000000000000') {
        throw new Error('Ticket does not exist or is not owned by anyone');
      }
  
      await ticketSales.methods.offerSwap(existingOwner).send({
        from: window.ethereum.selectedAddress,
      });
  
      setNotification(`Offer to swap ticket ${currentOwner} for ticket ${ticketId} sent successfully!`);
    } catch (error) {
      setNotification(`Error offering swap: ${error.message}`);
    }
  };
  
  const acceptSwap = async () => {
    try {
      const partnerId = parseInt(acceptOfferId);
  
      const currentOwner = await ticketSales.methods.getTicketOf(window.ethereum.selectedAddress).call();
      if (currentOwner <= 0) {
        throw new Error('You do not own a ticket');
      }
  
      const existingOwner = await ticketSales.methods.ticketOwnersByTicketId(partnerId).call();
      if (existingOwner === '0x0000000000000000000000000000000000000000') {
        throw new Error('Partner does not own a ticket');
      }
  
      await ticketSales.methods.acceptSwap(existingOwner).send({
        from: window.ethereum.selectedAddress,
      });
  
      setNotification(`Swap with ticket ${partnerId} accepted successfully!`);
    } catch (error) {
      setNotification(`Error accepting swap: ${error.message}`);
    }
  };
  
  const getTicketNumber = async () => {
    try {
      const currentOwner = await ticketSales.methods.getTicketOf(window.ethereum.selectedAddress).call();
      if (currentOwner <= 0) {
        throw new Error('You do not own a ticket');
      }
  
      setUserTicketId(currentOwner);
      setNotification(`Your ticket number is: ${currentOwner}`);
    } catch (error) {
      setNotification(`Error getting ticket number: ${error.message}`);
    }
  };
  
  const returnTicket = async () => {
    try {
      const currentOwner = await ticketSales.methods.getTicketOf(window.ethereum.selectedAddress).call();
      if (currentOwner <= 0) {
        throw new Error('You do not own a ticket');
      }
  
      const transactionReceipt = await ticketSales.methods.returnTicket(currentOwner).send({
        from: window.ethereum.selectedAddress,
      });
  
      if (transactionReceipt.status) {
        setNotification(`Ticket ${currentOwner} returned successfully. Refund in progress.`);
      } else {
        setNotification(`Transaction failed. Check the transaction receipt for details.`);
        console.error(transactionReceipt);
      }
    } catch (error) {
      setNotification(`Error returning ticket: ${error.message}`);
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Contract Owner: {owner}
        </p>
        <p>
          Ticket Price: {web3.utils.fromWei(ticketPrice, 'ether')} ETH
        </p>
        <div>
          <input
            type="number"
            placeholder="Enter Ticket ID"
            value={purchaseTicketId}
            onChange={(e) => setPurchaseTicketId(e.target.value)}
          />
          <button onClick={purchaseTicket}>Purchase Ticket</button>
        </div>

        <div>
  <input
    type="number"
    placeholder="Enter Ticket ID to Offer Swap"
    value={offerTicketId}
    onChange={(e) => setOfferTicketId(e.target.value)}
  />
  <button onClick={offerSwap}>Offer Swap</button>
</div>

<div>
  <input
    type="number"
    placeholder="Enter Ticket ID to Accept Swap"
    value={acceptOfferId}
    onChange={(e) => setAcceptOfferId(e.target.value)}
  />
  <button onClick={acceptSwap}>Accept Swap</button>
</div>


<div>
      <button onClick={getTicketNumber}>Get Ticket Number</button>
    </div>

    <div>
      <button onClick={returnTicket}>Return Ticket</button>
    </div>

        {notification && (
          <p style={{ marginTop: '10px', color: 'green' }}>{notification}</p>
        )}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

