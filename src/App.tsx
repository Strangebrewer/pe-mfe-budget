import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './index.css';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log("Remote App One render", location.pathname);

function Home() {
  console.log('rendering Home');
  const navigate = useNavigate();

  return (
    <div>
      <h1>Hey there!</h1>
      <button onClick={() => navigate('feck')}>Feck!</button>
    </div>
  );
}

  function Feck() {
    console.log('rendering Feck');
    return <div>Hey there, Feck!</div>;
  }

  function NotFound() {
    console.log('rendering NotFound');
    return <div>Error, Will Robinson!</div>;
  }

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="feck" element={<Feck />} />
      <Route path="*" element={<NotFound />} />
    </Routes >
  );
}

export default App;
