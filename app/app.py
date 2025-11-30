import os
import random
import string
from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/cultdb')
client = MongoClient(mongo_uri)
db = client.arcanum
keepers_collection = db.keepers

FLAG = os.environ.get('FLAG', 'CTF{PLACEHOLDER_FLAG}')

KEEPERS_POOL = [
    {"u": "Grand_Archivist", "p": "V0id_Wh1sp3rs_Deep"},
    {"u": "Keeper_Malachai", "p": "S0uls_B1nd_F0r3v3r"},
    {"u": "Sister_Vespera",  "p": "Bl00d_M00n_R1s1ng"},
    {"u": "High_Inquisitor", "p": "Purge_Th3_H3r3tic"},
    {"u": "Silent_Monk",     "p": "Ech0_0f_S1l3nc3"},
    {"u": "Blind_Oracle",    "p": "N0_S1ght_Just_F34r"},
    {"u": "Crypt_Lord",      "p": "D34th_1s_n0t_th3_End"}
]

arcane_config = {
    "name_glyph": "true_name",
    "seal_glyph": "secret_seal",
    "target_keeper": "Grand_Archivist"
}

def generate_rune_string(length=5):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def regenerate_sanctum():
    global arcane_config
    
    keeper = random.choice(KEEPERS_POOL)
    
    new_name_glyph = f"v_{generate_rune_string()}_essence"
    new_seal_glyph = f"s_{generate_rune_string()}_sigil"
    
    keepers_collection.delete_many({})
    
    keepers_collection.insert_one({
        "username": keeper['u'],
        "password": keeper['p'],
        "info": FLAG 
    })
    
    arcane_config["name_glyph"] = new_name_glyph
    arcane_config["seal_glyph"] = new_seal_glyph
    arcane_config["target_keeper"] = keeper['u']
    
    print(f"[RE-ROLL] Keeper: {keeper['u']} | Glyphs: {new_name_glyph} / {new_seal_glyph}", flush=True)

regenerate_sanctum()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sanctum')
def portal():
    return render_template('portal.html')

@app.route('/api/divination', methods=['GET'])
def get_runes():
    regenerate_sanctum()
    return jsonify({
        "status": "divination_success",
        "glyphs": {
            "primary": arcane_config["name_glyph"],
            "secondary": arcane_config["seal_glyph"]
        }
    })

@app.route('/api/invoke', methods=['POST'])
def invoke_spell():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Пустота..."}), 400

        u_field = arcane_config["name_glyph"]
        p_field = arcane_config["seal_glyph"]

        user_input = data.get(u_field)
        pass_input = data.get(p_field)

        if user_input is None or pass_input is None:
             return jsonify({
                 "success": False, 
                 "message": "Руны изменились. Вы слишком медлили."
             }), 400

        query = {
            "username": user_input,
            "password": pass_input
        }
        
        keeper = keepers_collection.find_one(query)

        if keeper:
            return jsonify({"success": True, "secret": keeper['info']})
        else:
            return jsonify({"success": False, "message": "Духи молчат."}), 401

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Хаос."}), 500

@app.route('/oblivion')
def defeat():
    return render_template('defeat.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)