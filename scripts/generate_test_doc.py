import os
from PIL import Image, ImageDraw, ImageFont

def generate_medical_document():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "sample-documents")
    os.makedirs(output_dir, exist_ok=True)
    
    png_path = os.path.join(output_dir, "WellNest_Medical_Prescription_Summary.png")
    pdf_path = os.path.join(output_dir, "WellNest_Medical_Prescription_Summary.pdf")

    # Image dimensions: A4 at 150 DPI (1240 x 1754 px)
    width = 1240
    height = 1754
    image = Image.new("RGB", (width, height), color="#FFFFFF")
    draw = ImageDraw.Draw(image)

    # Fonts
    font_dir = "C:\\Windows\\Fonts"
    f_title = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 30)
    f_subtitle = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 16)
    f_section = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 18)
    f_body_bold = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 15)
    f_body = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 15)
    f_small = ImageFont.truetype(os.path.join(font_dir, "arial.ttf"), 13)
    f_small_bold = ImageFont.truetype(os.path.join(font_dir, "arialbd.ttf"), 13)

    # Margins
    mx = 70
    y = 50

    # Header Top Bar
    draw.rectangle([mx, y, width - mx, y + 6], fill="#2A4365")
    y += 20

    # Hospital / Clinic Header
    draw.text((mx, y), "ST. JUDE MEDICAL CENTER", fill="#1A365D", font=f_title)
    draw.text((width - mx - 220, y + 8), "MRN: #WN-849201", fill="#4A5568", font=f_body_bold)
    y += 38

    draw.text((mx, y), "Department of Internal Medicine & Cardiology", fill="#2B6CB0", font=f_subtitle)
    draw.text((width - mx - 220, y), "Date: September 18, 2026", fill="#718096", font=f_small)
    y += 24

    draw.text((mx, y), "1400 Health Science Boulevard, Suite 400 | Phone: (555) 382-9011 | Web: www.stjudemed.org", fill="#718096", font=f_small)
    y += 32

    draw.line([mx, y, width - mx, y], fill="#E2E8F0", width=2)
    y += 20

    # Document Banner
    draw.rectangle([mx, y, width - mx, y + 42], fill="#EBF8FF", outline="#BEE3F8", width=1)
    draw.text((mx + 20, y + 11), "OFFICIAL MEDICAL PRESCRIPTION & CLINICAL SUMMARY", fill="#2B6CB0", font=f_section)
    y += 60

    # Patient & Physician Details Box
    draw.rectangle([mx, y, width - mx, y + 105], fill="#F7FAFC", outline="#E2E8F0", width=1)
    
    # Col 1: Patient
    draw.text((mx + 20, y + 15), "PATIENT INFORMATION", fill="#4A5568", font=f_small_bold)
    draw.text((mx + 20, y + 38), "Name: Sarah Johnson", fill="#1A202C", font=f_body_bold)
    draw.text((mx + 20, y + 60), "Age / Gender: 48 / Female", fill="#4A5568", font=f_body)
    draw.text((mx + 20, y + 80), "Contact: (555) 749-1209", fill="#718096", font=f_small)

    # Col 2: Physician
    cx2 = mx + 550
    draw.text((cx2, y + 15), "ATTENDING PHYSICIAN", fill="#4A5568", font=f_small_bold)
    draw.text((cx2, y + 38), "Dr. Marcus Vance, MD, FACC", fill="#1A202C", font=f_body_bold)
    draw.text((cx2, y + 60), "Specialty: Cardiology & Internal Medicine", fill="#4A5568", font=f_body)
    draw.text((cx2, y + 80), "State License: #MD-782910 | NPI: 1849204918", fill="#718096", font=f_small)
    y += 125

    # Section 1: Clinical Diagnosis & Vitals
    draw.rectangle([mx, y, width - mx, y + 32], fill="#EDF2F7")
    draw.text((mx + 15, y + 6), "1. CLINICAL DIAGNOSIS & VITALS EVALUATION", fill="#2D3748", font=f_section)
    y += 45

    draw.text((mx + 15, y), "Primary Diagnosis: ", fill="#4A5568", font=f_body_bold)
    draw.text((mx + 175, y), "Essential Hypertension (Stage 1) with Mild Hyperlipidemia", fill="#1A202C", font=f_body)
    y += 26

    draw.text((mx + 15, y), "Vital Signs Recorded: ", fill="#4A5568", font=f_body_bold)
    draw.text((mx + 195, y), "Blood Pressure: 138/88 mmHg  |  Pulse: 72 bpm  |  SpO2: 98%  |  BMI: 26.4", fill="#1A202C", font=f_body)
    y += 40

    # Section 2: Prescription Orders (Rx)
    draw.rectangle([mx, y, width - mx, y + 32], fill="#EDF2F7")
    draw.text((mx + 15, y + 6), "2. PRESCRIPTION MEDICATION PLAN (Rx)", fill="#2D3748", font=f_section)
    y += 45

    meds = [
        {
            "num": "1",
            "name": "Lisinopril 10 mg Oral Tablet",
            "time": "Morning (8:00 AM)",
            "inst": "Take 1 tablet once daily in the morning with a full glass of water before breakfast.",
            "purpose": "Blood pressure control and cardiovascular organ protection.",
            "qty": "30 Tablets (Refills: 2)"
        },
        {
            "num": "2",
            "name": "Metformin 500 mg Oral Tablet",
            "time": "Afternoon (1:00 PM)",
            "inst": "Take 1 tablet once daily with the afternoon meal (lunch).",
            "purpose": "Glycemic regulation and metabolic optimization.",
            "qty": "30 Tablets (Refills: 3)"
        },
        {
            "num": "3",
            "name": "Atorvastatin 20 mg Oral Tablet",
            "time": "Night (8:00 PM)",
            "inst": "Take 1 tablet once daily at bedtime with or without food.",
            "purpose": "Lipid reduction to decrease LDL cholesterol and arterial plaque.",
            "qty": "30 Tablets (Refills: 2)"
        },
    ]

    for med in meds:
        draw.rectangle([mx + 10, y, width - mx - 10, y + 88], fill="#FFFFFF", outline="#CBD5E0", width=1)
        
        # Left tag
        draw.rectangle([mx + 10, y, mx + 45, y + 88], fill="#EBF8FF")
        draw.text((mx + 22, y + 32), med["num"], fill="#2B6CB0", font=f_section)

        # Medication details
        draw.text((mx + 60, y + 10), med["name"], fill="#1A365D", font=f_body_bold)
        draw.text((width - mx - 220, y + 10), f"Schedule: {med['time']}", fill="#2B6CB0", font=f_small_bold)

        draw.text((mx + 60, y + 36), "Instructions:", fill="#4A5568", font=f_small_bold)
        draw.text((mx + 155, y + 36), med["inst"], fill="#2D3748", font=f_small)

        draw.text((mx + 60, y + 60), "Indication / Purpose:", fill="#4A5568", font=f_small_bold)
        draw.text((mx + 205, y + 60), med["purpose"], fill="#718096", font=f_small)
        draw.text((width - mx - 200, y + 60), med["qty"], fill="#718096", font=f_small)

        y += 98

    y += 10

    # Section 3: Diagnostic Lab Results
    draw.rectangle([mx, y, width - mx, y + 32], fill="#EDF2F7")
    draw.text((mx + 15, y + 6), "3. DIAGNOSTIC LABORATORY FINDINGS (Specimen: Serum Blood Panel)", fill="#2D3748", font=f_section)
    y += 42

    # Table Header
    draw.rectangle([mx + 10, y, width - mx - 10, y + 26], fill="#F7FAFC", outline="#E2E8F0", width=1)
    draw.text((mx + 25, y + 5), "Test Description", fill="#4A5568", font=f_small_bold)
    draw.text((mx + 380, y + 5), "Result", fill="#4A5568", font=f_small_bold)
    draw.text((mx + 560, y + 5), "Reference Range", fill="#4A5568", font=f_small_bold)
    draw.text((mx + 780, y + 5), "Clinical Flag", fill="#4A5568", font=f_small_bold)
    y += 28

    labs = [
        ("Fasting Blood Glucose", "104 mg/dL", "70 - 99 mg/dL", "Borderline Elevated", "#C53030"),
        ("Total Serum Cholesterol", "215 mg/dL", "< 200 mg/dL", "Mildly Elevated", "#C53030"),
        ("Serum Creatinine", "0.9 mg/dL", "0.6 - 1.2 mg/dL", "Normal Range", "#2F855A"),
        ("Serum Potassium (K+)", "4.3 mEq/L", "3.5 - 5.0 mEq/L", "Normal Range", "#2F855A"),
        ("Estimated GFR", "> 90 mL/min", "> 60 mL/min", "Optimal Kidney Function", "#2F855A"),
    ]

    for lab, val, ref, flag, flag_col in labs:
        draw.rectangle([mx + 10, y, width - mx - 10, y + 26], fill="#FFFFFF", outline="#EDF2F7", width=1)
        draw.text((mx + 25, y + 5), lab, fill="#2D3748", font=f_small)
        draw.text((mx + 380, y + 5), val, fill="#1A202C", font=f_small_bold)
        draw.text((mx + 560, y + 5), ref, fill="#718096", font=f_small)
        draw.text((mx + 780, y + 5), flag, fill=flag_col, font=f_small_bold)
        y += 27

    y += 20

    # Section 4: Discharge & Follow-up Instructions
    draw.rectangle([mx, y, width - mx, y + 32], fill="#EDF2F7")
    draw.text((mx + 15, y + 6), "4. DISCHARGE ORDERS & PATIENT CARE INSTRUCTIONS", fill="#2D3748", font=f_section)
    y += 42

    instructions = [
        "Follow-up: Return to clinic in 4 weeks for repeat blood pressure check and lipid panel follow-up.",
        "Medication Adherence: Take morning and night doses consistently. If a dose is missed, do not double up.",
        "Dietary Guidance: Restrict daily sodium intake to under 2,000 mg (DASH diet). Avoid grapefruit with Atorvastatin.",
        "Warning Signs: Contact clinic or emergency care if experiencing dizziness, facial swelling, or chest pressure."
    ]

    for inst in instructions:
        draw.ellipse([mx + 18, y + 6, mx + 24, y + 12], fill="#2B6CB0")
        draw.text((mx + 35, y), inst, fill="#2D3748", font=f_small)
        y += 24

    y += 25

    # Footer: Physician Signature & Verification Stamp
    draw.line([mx, y, width - mx, y], fill="#CBD5E0", width=1)
    y += 20

    draw.text((mx + 20, y), "Physician Signature:", fill="#718096", font=f_small)
    draw.text((mx + 20, y + 25), "Dr. Marcus Vance, MD", fill="#1A365D", font=f_title)
    draw.text((mx + 20, y + 65), "Board Certified in Internal Medicine & Cardiovascular Disease", fill="#718096", font=f_small)

    # Security Verification Stamp Box
    stamp_x = width - mx - 280
    draw.rectangle([stamp_x, y, width - mx - 10, y + 80], fill="#F7FAFC", outline="#4A5568", width=1)
    draw.text((stamp_x + 15, y + 12), "CLINIC VALIDATION STAMP", fill="#4A5568", font=f_small_bold)
    draw.text((stamp_x + 15, y + 34), "St. Jude Medical Clinic #400", fill="#718096", font=f_small)
    draw.text((stamp_x + 15, y + 54), "Electronic Rx Order ID: #RX-2026-918", fill="#2B6CB0", font=f_small_bold)

    # Save as PNG
    image.save(png_path, "PNG", quality=95)
    print("Saved PNG to:", png_path)

    # Save as PDF
    image.convert("RGB").save(pdf_path, "PDF", resolution=150.0)
    print("Saved PDF to:", pdf_path)

if __name__ == "__main__":
    generate_medical_document()
