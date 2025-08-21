import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

function Filterpage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();

    const handleFilter = () => {
        if (!startDate || !endDate) {
            alert("Silakan pilih tanggal mulai dan tanggal akhir.");
            return;
        }
        setLoading(true);
        axios.get('http://localhost:8080/api/sentiments', {
            params: { startDate, endDate }
        })
        .then(response => { setData(response.data); setLoading(false); })
        .catch(error => { console.error("Error fetching data:", error); setLoading(false); });
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
        setEndDate('');
    };

    const chartData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            label: 'Jumlah Tweet',
            data: data ? data.chartData : [0, 0, 0],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        }],
    };
    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Hasil Sentimen Berdasarkan Filter' } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    return (
        <div>
            <div className="back-button-container">
                 <button onClick={() => navigate('/')}>← Kembali ke Home</button>
            </div>

            <div className="filter-controls">
                <div className="date-picker-group">
                    <div className="date-picker">
                        <label>Tanggal Mulai:</label>
                        <input 
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            min="2024-08-01"
                            max="2025-07-31"
                        />
                    </div>
                    <div className="date-picker">
                        <label>Tanggal Akhir:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            max="2025-07-31"
                            disabled={!startDate}
                        />
                    </div>
                </div>
                <button 
                    className="filter-button" 
                    onClick={handleFilter} 
                    disabled={!startDate || !endDate}
                >
                    Terapkan Filter
                </button>
            </div>

            <div className="result-container">
                {loading ? (
                    <p>Memuat data...</p>
                ) : data ? (
                    <div className="content">
                        <div className="table-container">
                            <table>
                                <tbody>
                                    <tr><td>Positive</td><td>{data.positivePercentage.toFixed(2)}%</td></tr>
                                    <tr><td>Neutral</td><td>{data.neutralPercentage.toFixed(2)}%</td></tr>
                                    <tr><td>Negative</td><td>{data.negativePercentage.toFixed(2)}%</td></tr>
                                    <tr><td><strong>Total Tweets</strong></td><td><strong>{data.totalTweets.toLocaleString()}</strong></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="chart-container">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                ) : (
                    <p style={{textAlign: 'center', marginTop: '30px'}}>Pilih rentang tanggal dan klik "Terapkan Filter" untuk melihat hasilnya.</p>
                )}
            </div>
        </div>
    );
}

export default Filterpage;