from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.json_util import dumps
from flask_cors import CORS
import geoip2.database
import os

app = Flask(__name__)
CORS(app) 

GEOIP_DB_PATH = os.path.join(os.path.dirname(__file__), 'GeoLite2-City.mmdb')
geoip_reader = None


def load_geoip_reader():
    global geoip_reader
    try:        
        geoip_reader = geoip2.database.Reader(GEOIP_DB_PATH)
        print("GeoLite2 database loaded successfully.")
    except Exception as e:
        print(f"Error loading GeoLite2 database: {e}")
        
        geoip_reader = None

def get_location_info(ip):
    
    if geoip_reader is None or ip.startswith('192.168.') or ip.startswith('10.') or ip.startswith('172.16.'):
        
        return None

    try:
        response = geoip_reader.city(ip)
        return {
            'latitude': response.location.latitude,
            'longitude': response.location.longitude,
            'city': response.city.name or response.subdivisions.most_specific.name or 'N/A',
            'country': response.country.name or 'N/A'
        }
    except geoip2.errors.AddressNotFoundError:
        return {'city': 'Desconhecido', 'country': 'N/A'}
    except Exception:
        
        return None


client = MongoClient('mongodb://localhost:27017/')
db = client['network_monitor_db']
collection = db['packets']

@app.route('/api/traffic/protocols', methods=['GET'])
def get_protocol_summary():
    src_ip_filter = request.args.get('src_ip')
    dst_ip_filter = request.args.get('dst_ip')
    
    # 2. Construir a Fase $match
    match_criteria = {}
    if src_ip_filter:
        match_criteria['src_ip'] = src_ip_filter
    if dst_ip_filter:
        match_criteria['dst_ip'] = dst_ip_filter

    
    # time_limit = datetime.now() - timedelta(hours=24)
    # match_criteria['timestamp'] = { "$gte": time_limit }
    
    
    
    
    pipeline = []
    
    
    if match_criteria:
        pipeline.append({ "$match": match_criteria })
        
    
    pipeline.extend([
        { "$group": {
            "_id": "$protocol", 
            "count": { "$sum": 1 } 
        }},
        { "$sort": { "count": -1 } }
    ])
    
    
    try:
        protocol_summary = collection.aggregate(pipeline)
        return dumps(list(protocol_summary)), 200
        
    except Exception as e:
        print(f"Erro na agregação de protocolo: {e}")
        return jsonify({"error": "Failed to fetch protocol data"}), 500

@app.route('/api/traffic/timeline', methods=['GET'])
def get_traffic_timeline():
    
    
    time_limit = datetime.now() - timedelta(minutes=10)
    
    
    recent_packets = collection.find(
        {"timestamp": {"$gte": time_limit}}
    ).sort("timestamp", -1).limit(500) 
    
    return dumps(list(recent_packets)), 200

@app.route('/api/traffic/volume', methods=['GET'])
def get_traffic_volume():

    src_ip_filter = request.args.get('src_ip')
    dst_ip_filter = request.args.get('dst_ip')   
    
    now = datetime.now()
    time_limit = now - timedelta(minutes=30)
    bucket_size_seconds = 60 

    
    match_criteria = { "timestamp": { "$gte": time_limit } }
    
    if src_ip_filter:
        match_criteria['src_ip'] = src_ip_filter
    if dst_ip_filter:
        match_criteria['dst_ip'] = dst_ip_filter

    
    pipeline = [
        
        { "$match": match_criteria },
        
        
        { "$bucket": {
            "groupBy": "$timestamp",
            "boundaries": [time_limit + timedelta(seconds=i * bucket_size_seconds) 
                           for i in range(31)], 
            "default": "Outros",
            "output": {
                "count": { "$sum": 1 },
                "total_bytes": { "$sum": "$length" }
            }
        }},
        
        
        { "$project": {
            "time_bucket": "$_id",
            "count": 1,
            "total_bytes": 1,
            "_id": 0
        }},
        
        
        { "$sort": { "time_bucket": 1 } }
    ]
    
    
    try:
        traffic_volume = collection.aggregate(pipeline)
        return dumps(list(traffic_volume)), 200
        
    except Exception as e:
        print(f"Erro na agregação de volume de tráfego: {e}")
        return jsonify({"error": "Failed to fetch traffic volume data"}), 500
    

@app.route('/api/traffic/topips', methods=['GET'])
def get_top_ips():
    
    time_limit = datetime.now() - timedelta(minutes=30)
    
    
    pipeline_dst = [
        { "$match": { 
            "timestamp": { "$gte": time_limit },
            "dst_ip": { "$exists": True } 
        }},
        { "$group": { 
            "_id": "$dst_ip", 
            "count": { "$sum": 1 } 
        }},
        { "$sort": { "count": -1 } },
        { "$limit": 10 }
    ]

    
    pipeline_src = [
        { "$match": { 
            "timestamp": { "$gte": time_limit },
            "src_ip": { "$exists": True }
        }},
        { "$group": { 
            "_id": "$src_ip", 
            "count": { "$sum": 1 } 
        }},
        { "$sort": { "count": -1 } },
        { "$limit": 10 }
    ]

    try:
        top_dst_raw = list(collection.aggregate(pipeline_dst))
        top_src_raw = list(collection.aggregate(pipeline_src))
        
        def enrich_with_location(ip_list):
            enriched_list = []
            for item in ip_list:
                ip = item['_id']
                item['location'] = get_location_info(ip)
                enriched_list.append(item)
            return enriched_list

        top_dst_enriched = enrich_with_location(top_dst_raw)
        top_src_enriched = enrich_with_location(top_src_raw)

        return dumps({
            "top_destination": top_dst_enriched,
            "top_source": top_src_enriched
        }), 200
        
    except Exception as e:
        print(f"Erro na agregação de Top IPs: {e}")
        return jsonify({"error": "Failed to fetch top IPs data"}), 500    


if __name__ == '__main__':

    try:
        geoip_reader = geoip2.database.Reader(GEOIP_DB_PATH)
        print("GeoLite2 database loaded successfully.")
    except Exception as e:
        print(f"Error loading GeoLite2 database: {e}. Geolocation will be disabled.")
        geoip_reader = None
    
    app.run(debug=True, port=5000)