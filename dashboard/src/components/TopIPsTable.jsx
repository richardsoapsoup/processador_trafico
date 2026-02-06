import React, { useState, useEffect } from 'react';

const TopIPsTable = () => {
    const [topIPs, setTopIPs] = useState({ top_source: [], top_destination: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/traffic/topips');
                if (!response.ok) { throw new Error('Falha na API de Top IPs'); }
                
                const data = await response.json();
                
                
                setTopIPs({
                    top_source: data.top_source.map(item => ({ ip: item._id, count: item.count })),
                    top_destination: data.top_destination.map(item => ({ ip: item._id, count: item.count }))
                });

            } catch (error) {
                console.error("Erro ao buscar Top IPs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Atualiza a cada 10 segundos

        return () => clearInterval(interval);
    }, []);

    const renderTable = (data, title) => (
        <div className="column is-6">
            <h4 className="title is-5 has-text-centered has-text-link has-text-weight-bold">{title}</h4>
            <table className="table is-striped is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Endereço IP</th>
                        <th>Contagem de Pacotes</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.ip}>
                            <td>{index + 1}</td>
                            <td className="has-text-weight-bold">{item.ip}</td>
                            <td>{item.count.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (isLoading) {
        return <p className="has-text-centered p-6">Carregando Top IPs...</p>;
    }

    return (
        <div className="columns is-multiline is-mobile">
            {renderTable(topIPs.top_source, "Origem (Source)")}
            {renderTable(topIPs.top_destination, "Destino (Destination)")}
        </div>
    );
};

export default TopIPsTable;