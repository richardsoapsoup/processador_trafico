from scapy.all import sniff, IP, TCP, UDP
from pymongo import MongoClient
from datetime import datetime



client = MongoClient('mongodb://localhost:27017/')
db = client['network_monitor_db'] 
collection = db['packets'] 

def process_and_save_packet(packet):
   
    packet_data = {}
    
   
    packet_data['timestamp'] = datetime.now()
    
 
    if IP in packet:
        ip_layer = packet[IP]
        packet_data['src_ip'] = ip_layer.src
        packet_data['dst_ip'] = ip_layer.dst
        packet_data['protocol'] = ip_layer.proto 
        packet_data['length'] = len(packet)
        
        
        if TCP in packet:
            packet_data['transport'] = 'TCP'
            packet_data['src_port'] = packet[TCP].sport
            packet_data['dst_port'] = packet[TCP].dport
        elif UDP in packet:
            packet_data['transport'] = 'UDP'
            packet_data['src_port'] = packet[UDP].sport
            packet_data['dst_port'] = packet[UDP].dport
        else:
            packet_data['transport'] = 'OUTROS'
            
       
        try:
            collection.insert_one(packet_data)
            print(f"Pacote salvo. Src: {packet_data['src_ip']}, Protocolo: {packet_data['transport']}")
        except Exception as e:
            print(f"Erro ao salvar no MongoDB: {e}")


print("Iniciando a captura e o salvamento de pacotes...")


sniff(prn=process_and_save_packet, iface='Intel(R) Wi-Fi 6 AX101', store=0)