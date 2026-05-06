import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import Bills from './pages/Bills';
import Categories from './pages/Categories';

function Accounts() {
  return <div><h1>Accounts</h1></div>;
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
      <Route index element={<Bills />} />
      <Route path="accounts" element={<Accounts />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="categories/:owner" element={<Categories />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
