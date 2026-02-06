import React, { useState } from 'react';
import ProtocolChart from './components/ProtocolChart';
import TimelineChart from './components/TimeLineChart';
import TopIPsTable from './components/TopIPsTable';
import MapChart from './components/MapChart';

function App() {

  const [filters, setFilters] = useState({
    src_ip: '',
    dst_ip: '',
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ src_ip: '', dst_ip: '' });
  };

  return (
    <div className="App">
      
      <nav className="navbar is-dark" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <h1 className="is-size-4 has-text-weight-bold has-text-white">
              <span className="icon"><i className="fas fa-network-wired"></i></span> 🌐 NetMonitor TCC
            </h1>
          </a>
        </div>
      </nav>

      
      <section className="section">
        <div className="container">
          
          <h2 className="title is-2 has-text-centered has-text-grey-dark">
            Monitoramento de Tráfego de Rede em Tempo Real
          </h2>
          <p className="subtitle is-6 has-text-centered mb-6">
            Análise em tempo real de pacotes capturados (TCP, UDP e Outros)
          </p>

          <div className="box has-background-white-ter p-4 mb-5">
            <h3 className="title is-5 has-text-centered has-text-link has-text-weight-bold">Filtros de Tráfego</h3>
            <div className="columns is-vcentered">
                
                <div className="column is-4">
                    <div className="field">
                        <label className="label is-5 has-text-centered has-text-link has-text-weight-bold">IP de Origem (Source)</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="text" 
                                placeholder="e.g. 192.168.1.10"
                                name="src_ip"
                                value={filters.src_ip}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>
                
                
                <div className="column is-4">
                    <div className="field">
                        <label className="label is-5 has-text-centered has-text-link has-text-weight-bold">IP de Destino (Destination)</label>
                        <div className="control">
                            <input 
                                className="input" 
                                type="text" 
                                placeholder="e.g. 8.8.8.8"
                                name="dst_ip"
                                value={filters.dst_ip}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>

                
                <div className="column is-4 has-text-right">
                    <button 
                        className="button is-danger is-light"
                        onClick={clearFilters}
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>
          </div>

          
          <div className="columns is-multiline">
            
            
            <div className="column is-4">
              <div className="card has-background-white p-4">
                <div className="card-header">
                  <p className="card-header-title is-size-5 has-text-link">
                    📊 Resumo de Protocolos
                  </p>
                </div>
                <div className="card-content">
                
                  <ProtocolChart filters={filters} />
                </div>
              </div>
            </div>

            
            <div className="column is-8">
              <div className="card has-background-white p-4">
                <div className="card-header">
                  <p className="card-header-title is-size-5 has-text-link">
                    📈 Tráfego na Linha do Tempo (Últimos 10 Minutos)
                  </p>
                </div>
                <div className="card-content" style={{ minHeight: '350px' }}>
                  <TimelineChart filters={filters} />                  
                </div>
              </div>
            </div>


              <div className="columns is-multiline mb-5">
                <div className="column is-12">
                    <div className="card has-background-white p-4">
                        <div className="card-header">
                            <p className="card-header-title is-size-5 has-text-link">
                                🗺️ Distribuição Geográfica do Tráfego Externo
                            </p>
                        </div>
                        <div className="card-content">
                            <MapChart /> 
                        </div>
                    </div>
                </div>
            </div>

            <div className="columns is-multiline">
              <div className="column is-12">
                <div className="card has-background-white p-4">
                  <div className="card-header">
                    <p className="card-header-title is-size-5 has-text-link">
                    👤 Top 10 Hosts Mais Ativos (Últimos 30 Minutos)
                    </p>
                </div>
                <div className="card-content">
                  <TopIPsTable /> 
                </div>
              </div>
            </div>


          </div>          
            
          </div>
        </div>
      </section>

      
      <footer className="footer has-background-light">
        <div className="content has-text-centered">
          <p>
            <strong>NetMonitor TCC</strong>. Desenvolvido para TCC - {new Date().getFullYear()}. 
            Tecnologias: Python/Scapy, MongoDB, Flask, React/Bulma.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;