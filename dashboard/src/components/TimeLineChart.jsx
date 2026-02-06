import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TimelineChart = ( { filters }) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {

            let queryString = '';
            if (filters && (filters.src_ip || filters.dst_ip)) {
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
                const url = `http://localhost:5000/api/traffic/volume${queryString}`;
                const response = await fetch(url);
                const rawData = await response.json();

                
                const labels = rawData.map(item => {
                   
                    const date = new Date(item.time_bucket['$date']); 
                    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                });
                
                
                const volumeInMB = rawData.map(item => (item.total_bytes / 1024 / 1024).toFixed(2)); 
                const packetCount = rawData.map(item => item.count);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Volume de Dados (MB)',
                            data: volumeInMB,
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            yAxisID: 'yVolume',
                            tension: 0.3 // Curvas suaves
                        },
                        {
                            label: 'Contagem de Pacotes',
                            data: packetCount,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            yAxisID: 'yCount',
                            tension: 0.3
                        }
                    ],
                });

            } catch (error) {
                console.error("Erro ao buscar dados de volume:", error);
            }
        };

        fetchData(); 
        const interval = setInterval(fetchData, 60000); 

        return () => clearInterval(interval);
    }, [filters]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Tráfego de Rede por Minuto' },
        },
        scales: {
            yVolume: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Volume (MB)' }
            },
            yCount: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false }, 
                title: { display: true, text: 'Contagem de Pacotes' }
            }
        }
    };

    if (!chartData) {
        return <div className="loading-state has-text-centered p-6">Carregando dados da linha do tempo...</div>;
    }

    return (
        <div className="chart-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default TimelineChart;