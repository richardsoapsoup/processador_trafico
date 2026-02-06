import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProtocolChart = ({ filters }) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {

            let queryString = '';
            if (filters.src_ip || filters.dst_ip) {
                const params = new URLSearchParams();
                if (filters.src_ip) {
                    params.append('src_ip', filters.src_ip);
                }
                if (filters.dst_ip) {
                    params.append('dst_ip', filters.dst_ip);
                }
                queryString = `?${params.toString()}`;
            }    

            try {
                
                const url = (`http://localhost:5000/api/traffic/protocols${queryString}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const rawData = await response.json();
                
                
                const labels = rawData.map(item => item._id);
                const data = rawData.map(item => item.count);
                
                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Contagem de Pacotes',
                            data: data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)', 
                                'rgba(54, 162, 235, 0.6)', 
                                'rgba(255, 206, 86, 0.6)', 
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });

            } catch (error) {
                console.error("Erro ao buscar dados de protocolos:", error);
            }
        };

        fetchData(); 
        const interval = setInterval(fetchData, 5000); 

        return () => clearInterval(interval);
    }, [filters]);

    if (!chartData) {
        return <div className="loading-state">Carregando dados de protocolos...</div>;
    }

    return (
        <div className="chart-container" style={{ maxWidth: '400px', margin: 'auto' }}>
            <h3>Distribuição de Protocolos</h3>
            <Pie data={chartData} />
        </div>
    );
};

export default ProtocolChart;