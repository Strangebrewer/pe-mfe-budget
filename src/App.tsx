import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';

function Accounts() {
  return <div><h1>Accounts</h1></div>;
}

function Bills() {
  return <div><h1>Bills</h1></div>;
}

function Transactions() {
  return <div><h1>Transactions</h1></div>;
}

function NotFound() {
  return <div>Not found</div>;
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="accounts" element={<Accounts />} />
      <Route path="bills" element={<Bills />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
