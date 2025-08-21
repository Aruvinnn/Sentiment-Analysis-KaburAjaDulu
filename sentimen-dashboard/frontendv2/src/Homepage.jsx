import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function Homepage() {
    const [data, setData] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const months = [
        { name: "Agustus 2024", start: "2024-08-01", end: "2024-08-31" },
        { name: "September 2024", start: "2024-09-01", end: "2024-09-30" },
        { name: "Oktober 2024", start: "2024-10-01", end: "2024-10-31" },
        { name: "November 2024", start: "2024-11-01", end: "2024-11-30" },
        { name: "Desember 2024", start: "2024-12-01", end: "2024-12-31" },
        { name: "Januari 2025", start: "2025-01-01", end: "2025-01-31" },
        { name: "Februari 2025", start: "2025-02-01", end: "2025-02-28" },
        { name: "Maret 2025", start: "2025-03-01", end: "2025-03-31" },
        { name: "April 2025", start: "2025-04-01", end: "2025-04-30" },
        { name: "Mei 2025", start: "2025-05-01", end: "2025-05-31" },
        { name: "Juni 2025", start: "2025-06-01", end: "2025-06-30" },
        { name: "Juli 2025", start: "2025-07-01", end: "2025-07-31" },
    ];

    useEffect(() => {
        const startDate = '2024-08-01';
        const endDate = '2025-07-31';

        axios.get('http://localhost:8080/api/sentiments', { params: { startDate, endDate } })
            .then(response => setData(response.data))
            .catch(error => console.error("Error fetching total data:", error));

        const fetchMonthly = async () => {
            let results = [];
            for (let m of months) {
                try {
                    const res = await axios.get('http://localhost:8080/api/sentiments', {
                        params: { startDate: m.start, endDate: m.end }
                    });
                    results.push({
                        month: m.name,
                        pos: res.data.chartData[0],
                        neu: res.data.chartData[1],
                        neg: res.data.chartData[2]
                    });
                } catch (err) {
                    console.error("Err month", m.name, err);
                    results.push({ month: m.name, pos: 0, neu: 0, neg: 0 });
                }
            }
            setMonthlyData(results);
            setLoading(false);
        };

        fetchMonthly();
    }, []);

    if (loading) return <p>Loading data....</p>;

    const barChartData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            label: 'Jumlah Tweet',
            data: data ? data.chartData : [0, 0, 0],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        }],
    };

    const barChartOptions = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Ringkasan Sentimen Total (Aug 2024 - Jul 2025)' } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    const lineChartData = {
        labels: monthlyData.map(m => m.month),
        datasets: [
            {
                label: 'Positif',
                data: monthlyData.map(m => m.pos),
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50',
                tension: 0.3
            },
            {
                label: 'Netral',
                data: monthlyData.map(m => m.neu),
                borderColor: '#FFC107',
                backgroundColor: '#FFC107',
                tension: 0.3
            },
            {
                label: 'Negatif',
                data: monthlyData.map(m => m.neg),
                borderColor: '#F44336',
                backgroundColor: '#F44336',
                tension: 0.3
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            tooltip: { enabled: true },   
            title: { display: true, text: 'Tren Sentimen Bulanan (Aug 2024 - Jul 2025)' }
        },
        interaction: { mode: 'index', intersect: false }, 
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    };

    return (
        <div>
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
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
            </div>

            <hr className="chart-divider" />

            <div className="chart-container linechart-full" style={{ marginTop: "40px" }}>
                <Line data={lineChartData} options={lineChartOptions} />
            </div>

            <div className="button-container">
                <button onClick={() => navigate('/filter')}>
                    Filter Data Berdasarkan Rentang Tanggal
                </button>
            </div>
        </div>
    );
}

export default Homepage;
