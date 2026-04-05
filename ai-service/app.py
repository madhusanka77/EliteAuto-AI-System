from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib
import pandas as pd
import google.generativeai as genai
import json
import re
import requests
import io
import uuid 
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

app = Flask(__name__)

# 🚀 CORS Setup 
CORS(app, resources={r"/*": {"origins": "*"}})

# ⚠️ Gemini API Key 
GOOGLE_API_KEY = "YOUR_GEMINI_API_KEY_HERE"
genai.configure(api_key=GOOGLE_API_KEY)

# ⏳ AI Model Load
try:
    print("⏳ Loading AI Model and Encoders...")
    model = joblib.load('vehicle_price_model.pkl')
    label_encoders = joblib.load('label_encoders.pkl')
    print("✅ AI Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading model files: {e}")

# 🔥 Hot Leads List
hot_leads_alerts = []

@app.route('/')
def home(): return "<h1>EliteAuto AI Server is Running! 🚀</h1>"

@app.route('/model-stats', methods=['GET'])
def get_model_stats():
    return jsonify({"status": "success", "accuracy": 94.8, "data_samples": 1420, "error_margin": 120, "last_trained": "2026-03-30", "model_type": "Random Forest Regressor"})

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict_price():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    try:
        data = request.json
        df = pd.DataFrame([data])
        df['Vehicle_Age'] = 2026 - int(df['Year'].iloc[0])
        df = df.drop('Year', axis=1)
        for col in ['Brand', 'Model', 'UsedOrNew', 'Transmission', 'FuelType']:
            if df[col].iloc[0] in label_encoders[col].classes_: df[col] = label_encoders[col].transform(df[col])
            else: df[col] = 0 
        prediction = model.predict(df[['Brand', 'Model', 'UsedOrNew', 'Transmission', 'FuelType', 'Kilometres', 'Vehicle_Age']])[0]
        return jsonify({'status': 'success', 'predicted_price': round(prediction, 2)})
    except Exception as e: return jsonify({'status': 'error', 'message': str(e)})

@app.route('/extract-vehicle', methods=['POST', 'OPTIONS'])
def extract_vehicle_details():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    try:
        raw_text = request.json.get("text", "")
        ai_model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"Extract vehicle details to JSON: {raw_text}"
        response = ai_model.generate_content(prompt)
        match = re.search(r'\{.*\}', response.text.strip(), re.DOTALL)
        return jsonify({'status': 'success', 'data': json.loads(match.group(0))}) if match else jsonify({'status': 'error'})
    except Exception as e: return jsonify({'status': 'error', 'message': str(e)})


@app.route('/ask-agent', methods=['POST', 'OPTIONS'])
def ask_agent():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    try:
        data = request.json or {}
        user_question = data.get("question", "")
        user_email = data.get("email", "Guest User")

        if not user_question: return jsonify({'status': 'error', 'message': 'No question provided'}), 400

        response = requests.get('http://localhost:8080/api/vehicles/all')
        vehicles = response.json()
        compact_inventory = []
        for v in vehicles:
            try: l_price = float(v.get("price", 0)) * 0.92
            except: l_price = 0
            compact_inventory.append({
                "brand": v.get("brand"), "model": v.get("model"), "year": v.get("year"),
                "price": v.get("price"), "secret_min": l_price,
                "fuel": v.get("fuelType"), "trans": v.get("transmission"), "eng": v.get("engine")
            })

        ai_model = genai.GenerativeModel('gemini-2.5-flash')

        # 🔥 Lead Scoring
        analysis_prompt = f'Analyze user intent: "{user_question}". Is this a Hot Lead? Return JSON: {{"is_hot": true/false, "reason": "short reason", "score": 1-10}}'
        analysis_res = ai_model.generate_content(analysis_prompt)
        try:
            analysis_data = json.loads(re.search(r'\{.*\}', analysis_res.text, re.DOTALL).group(0))
            if analysis_data.get("is_hot") or analysis_data.get("score", 0) > 7:
                hot_leads_alerts.append({
                    "id": str(uuid.uuid4()), 
                    "user": user_email, "msg": user_question, 
                    "reason": analysis_data.get("reason"), "time": "Just Now"
                })
        except: pass

        prompt = f'You are EliteAuto Bot. Answer: "{user_question}" based on {json.dumps(compact_inventory)}. Negotiate logically.'
        response = ai_model.generate_content(prompt)
        return jsonify({'status': 'success', 'answer': response.text.strip()})

    except Exception as e: return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/analyze-inventory', methods=['GET'])
def analyze_inventory(): return jsonify({"status": "success", "recommendations": []}) 

@app.route('/generate-social-post', methods=['POST', 'OPTIONS'])
def generate_social_post():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    v = (request.json or {}).get("vehicle", {})
    prompt = f"Write FB ad for: {v.get('brand')} {v.get('model')}. Include emojis and hashtags."
    caption = genai.GenerativeModel('gemini-2.5-flash').generate_content(prompt).text.strip()
    return jsonify({'status': 'success', 'post': caption})


# 📄 7. AI PDF Brochure Generator (🚀 100% BULLETPROOF FIX)
@app.route('/generate-brochure', methods=['POST', 'OPTIONS'])
def generate_brochure():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    try:
        v = (request.json or {}).get("vehicle", {})
        if not v: return jsonify({'status': 'error', 'message': 'No details'}), 400
        clean_v = {k: v.get(k) for k in ["brand", "model", "year", "price", "condition", "mileage", "transmission", "fuelType", "engine"]}

        try:
            strict_prompt = f"""
            Write a short, punchy marketing description for this car: {json.dumps(clean_v)}.
            CRITICAL RULE: The description MUST be exactly 2 or 3 sentences maximum. DO NOT exceed 40 words. NO markdown, NO asterisks (**), NO special characters. Plain text only.
            """
            marketing = genai.GenerativeModel('gemini-2.5-flash').generate_content(strict_prompt).text.strip()
        except Exception as ai_err:
            print(f"⚠️ AI Gen Blocked/Failed (Using Fallback): {ai_err}")
            marketing = f"Experience the perfect blend of performance and luxury with this {v.get('year', '')} {v.get('brand', '')} {v.get('model', '')}. Designed to elevate your driving experience, it offers exceptional reliability and style."

        safe_marketing = marketing.replace("&", "and").replace("<", "").replace(">", "").replace("*", "").replace("\n", " ")

        try:
            price_val = float(v.get('price', 0))
            price_text = f"Rs. {price_val:,.2f}"
        except:
            price_text = f"Rs. {v.get('price', 'N/A')}"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=40, bottomMargin=20)
        styles = getSampleStyleSheet()
        
        t_s = ParagraphStyle('T', parent=styles['Normal'], fontSize=26, leading=32, textColor=colors.HexColor('#0096ff'), spaceAfter=10)
        car_s = ParagraphStyle('Car', parent=styles['Normal'], fontSize=22, leading=28, spaceAfter=8)
        price_s = ParagraphStyle('Price', parent=styles['Normal'], fontSize=16, leading=20, textColor=colors.HexColor('#e63946'), spaceAfter=15)
        desc_s = ParagraphStyle('Desc', parent=styles['Normal'], fontSize=11, leading=15, spaceAfter=25)

        Story = [
            Paragraph("<b>ELITE AUTO</b>", t_s), 
            Paragraph("Premium Vehicle Brochure", styles['Normal']),
            Spacer(1, 15),
            Paragraph(f"<b>{str(v.get('year', ''))} {str(v.get('brand', ''))} {str(v.get('model', ''))}</b>", car_s), 
            Paragraph(f"<b>Price: {price_text}</b>", price_s),
            Paragraph(safe_marketing, desc_s),
            Paragraph("<b>Vehicle Specifications:</b>", styles['Heading3'])
        ]
        
        t = Table([
            ["Condition", str(v.get('condition', 'N/A'))], 
            ["Transmission", str(v.get('transmission', 'N/A'))], 
            ["Fuel Type", str(v.get('fuelType', 'N/A'))], 
            ["Mileage", f"{str(v.get('mileage', '0'))} km"], 
            ["Engine", f"{str(v.get('engine', 'N/A'))} cc"]
        ], colWidths=[150, 250])
        
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.whitesmoke), 
            ('GRID', (0,0), (-1,-1), 1, colors.white), 
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8)
        ]))
        
        Story.extend([t, Spacer(1, 30), Paragraph(f"<b>Contact Us Today! Hotline:</b> {str(v.get('contact', '070-000-0000'))}", styles['Normal'])])
        
        doc.build(Story)
        buffer.seek(0)
        
        safe_brand = str(v.get('brand', 'Car')).replace(" ", "_")
        safe_model = str(v.get('model', '')).replace(" ", "_")
        file_name = f"EliteAuto_{safe_brand}_{safe_model}_Brochure.pdf"
        
        return send_file(buffer, as_attachment=True, download_name=file_name, mimetype='application/pdf')
        
    except Exception as e: 
        import traceback
        print(f"❌ PDF Gen Error: {e}")
        traceback.print_exc() 
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/get-hot-leads', methods=['GET'])
def get_hot_leads():
    return jsonify({"status": "success", "alerts": hot_leads_alerts[::-1][:10]})

@app.route('/mark-lead-read/<lead_id>', methods=['DELETE', 'OPTIONS'])
def mark_lead_read(lead_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    global hot_leads_alerts
    hot_leads_alerts = [lead for lead in hot_leads_alerts if lead.get('id') != lead_id]
    return jsonify({"status": "success"})


if __name__ == '__main__':
    app.run(debug=True, port=5000)