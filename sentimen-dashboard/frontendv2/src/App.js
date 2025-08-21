import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import Filterpage from './Filterpage';
import './App.css'; 

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
    return (
        <Router>
            <div className="container">
                <h1>Sentimen Analisis Objek #KaburAjaDulu</h1>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/filter" element={<Filterpage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;