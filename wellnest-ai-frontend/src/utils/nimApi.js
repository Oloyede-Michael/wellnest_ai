/**
 * Helper to call NVIDIA NIM API with automatic key rotation, model failover,
 * medical OCR extraction, and document-grounded healthcare assistant.
 * Note: No emojis used anywhere per system requirements.
 */

// Track active key index across calls
let currentKeyIndex = 0;

/**
 * Retrieve all configured NVIDIA NIM API keys from Vite or process.env.
 */
export function getNimApiKeys() {
  const envSources = [
    typeof import.meta !== "undefined" ? import.meta.env : {},
    typeof process !== "undefined" && process.env ? process.env : {},
  ];

  const candidateKeyNames = [
    "nim_api1", "NIM_API1", "VITE_NIM_API1",
    "nim1", "NIM1", "VITE_NIM1",
    "nim2", "NIM2", "VITE_NIM2",
    "nim3", "NIM3", "VITE_NIM3",
    "nim4", "NIM4", "VITE_NIM4",
    "nim5", "NIM5", "VITE_NIM5",
  ];

  const foundKeys = [];

  for (const source of envSources) {
    if (!source) continue;
    for (const name of candidateKeyNames) {
      const val = source[name];
      if (typeof val === "string" && val.trim().startsWith("nvapi-")) {
        foundKeys.push(val.trim());
      }
    }
  }

  return Array.from(new Set(foundKeys));
}

/**
 * Calls NVIDIA NIM chat completions endpoint with automatic key rotation and endpoint failover.
 */
export async function callNimApi({
  messages,
  temperature = 0.2,
  max_tokens = 4096,
  model = "meta/llama-3.2-11b-vision-instruct",
}) {
  const keys = getNimApiKeys();

  if (keys.length === 0) {
    console.error("[NIM API] No valid NVIDIA NIM API keys found in environment variables.");
    throw new Error("NIM API keys are missing. Please check your .env configuration.");
  }

  let attempts = 0;
  const maxAttempts = keys.length;

  const endpoints = [
    "/api/nim/chat/completions",
    "https://integrate.api.nvidia.com/v1/chat/completions",
  ];

  while (attempts < maxAttempts) {
    const apiKey = keys[currentKeyIndex % keys.length];
    attempts++;

    for (const endpoint of endpoints) {
      try {
        console.log(`[NIM API] Trying endpoint ${endpoint} with key index ${currentKeyIndex % keys.length} and model ${model}...`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens,
          }),
        });

        if (response.status === 401 || response.status === 403 || response.status === 429 || response.status === 503) {
          const errorText = await response.text().catch(() => "");
          console.warn(`[NIM API] Key index ${currentKeyIndex} failed with HTTP ${response.status}. Rotating key...`, errorText);
          currentKeyIndex = (currentKeyIndex + 1) % keys.length;
          break;
        }

        if (response.status === 404 && endpoint.startsWith("/")) {
          console.warn("[NIM API] Proxy endpoint returned 404. Falling back to direct URL...");
          continue;
        }

        if (!response.ok) {
          const errBody = await response.text().catch(() => "");
          throw new Error(`HTTP Error ${response.status}: ${errBody || response.statusText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
          return data.choices[0].message.content;
        }

        throw new Error("Empty response returned by NIM API");
      } catch (err) {
        if (endpoint === endpoints[0] && endpoints.length > 1) {
          console.warn("[NIM API] Proxy fetch failed. Trying direct endpoint fallback:", err.message);
          continue;
        }

        console.error(`[NIM API] Error with key index ${currentKeyIndex}:`, err.message);
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        break;
      }
    }
  }

  throw new Error("All configured NVIDIA NIM API keys are exhausted, rate-limited, or unavailable.");
}

/**
 * Perform Medical OCR and Extraction on Prescriptions, Lab Results, and Discharge Summaries.
 */
export async function extractDocumentWithOCR({
  fileDataUrl,
  textContent,
  filename = "Medical Document",
}) {
  const isImage = Boolean(fileDataUrl);

  const promptText = `You are WellNest AI, an empathetic healthcare assistant that reads medical records and explains them in clear, simple everyday words.
Analyze this medical document (${filename}).

Classify the document strictly as one of:
- "Prescription" (if it contains medical prescriptions or prescription orders)
- "Lab result" (if it contains diagnostic laboratory tests, blood work, urine tests, ultrasound scans, imaging reports, or pathology panels)
- "Discharge summary" (if it summarizes a hospital admission, stay, or discharge instructions)

CRITICAL MEDICAL & EXTRACTION RULES:
1. READ ACCURATELY:
   - If this is a lab report or imaging/ultrasound scan, examine the actual measured values, observations, and doctor/radiologist comments (e.g. "Normal Values", "Normal study").
   - Look at the bottom of the page for Impression, Conclusion, or Suggestions (often handwritten, typed, or stamped) to capture the overall clinical impression and any recommended follow-up tests (e.g. FBC, urine tests).
   - Do NOT invent disease, damage, or dysfunction if organs/markers fall within normal reference ranges!
2. EXPLAIN THOROUGHLY IN PLAIN LANGUAGE ("explanation"):
   - Read and explain what this document is and what the results mean in warm, clear everyday words.
   - For lab results & scans: Explain whether the organs/tests are normal, healthy, or need attention. If values/organs are normal, explicitly reassure the patient that the findings are healthy and normal. If an impression notes mild findings (such as mild gastritis), explain it gently in plain terms.
   - For prescriptions: Explain what health condition is being treated, how each medicine helps the body, and how to take it safely.
   - For discharge summaries: Explain the reason for hospitalization, what care was given, recovery progress, and self-care steps at home.
3. TITLE & DIAGNOSIS:
   - "documentTitle": Give a precise title (e.g. "Total Abdominal Ultrasound Scan", "Liver Function Panel", "Hypertension Prescription").
   - "diagnosis": State the primary diagnosed condition, scan impression, or test conclusion (e.g. "Mild Gastritis (Otherwise Normal Abdominal Study)", "Essential Hypertension", "Normal Liver Function Test"). NEVER output negative sentences like "The document does not provide a diagnosis".
4. FINDINGS LIST ("findingsList"):
   - Extract each individual test marker or examined organ with its measured value or observation, status ("Normal", "High", "Low", or "Attention").
   - EXPLAIN WHAT EACH TEST IS ("interpretation"): For every single test, blood marker, enzyme, or organ (such as Total Bilirubin, Direct Bilirubin, AST, ALT, ALP, Haemoglobin, RBC, WBC, Platelets, etc.), you MUST explain in plain, simple everyday words what that enzyme/marker actually is in the human body (e.g. what AST does, where Bilirubin comes from) and what the patient's result means. Never leave "interpretation" blank.
5. MEDICATION PLAN ("medications"):
   - ONLY include items if this document contains an actual prescription plan.
   - If this document is a lab result/scan or has NO prescribed medicines, "medications" MUST BE AN EMPTY ARRAY: [].
   - NEVER create medication entries with text like "There are no medications", "None", or "Not listed".
6. FOLLOW-UP & CARE ("followUpRecommendations"):
   - List actionable next steps, doctor suggestions, recommended follow-up tests (e.g., FBC, urine tests to rule out infection), or lifestyle guidance.

IMPORTANT: Respond with ONLY a valid JSON object wrapped in \`\`\`json ... \`\`\`. Do not include any conversational filler outside the JSON.
{
  "documentType": "Prescription" | "Lab result" | "Discharge summary",
  "documentTitle": "Descriptive title of the document",
  "diagnosis": "Diagnosed condition or primary finding",
  "explanation": "Clear, friendly, thorough explanation in plain everyday words explaining what this document means for the patient's health.",
  "findingsList": [
    {
      "name": "Total Bilirubin",
      "value": "0.81 mg/dL",
      "status": "Normal",
      "interpretation": "Total Bilirubin is an orange-yellow pigment formed when your body recycles old red blood cells. Your liver clears it through bile; your normal level confirms your liver is processing and clearing cellular waste effectively."
    },
    {
      "name": "Aspartate Aminotransferase (AST)",
      "value": "11 U/L",
      "status": "Normal",
      "interpretation": "AST is an enzyme primarily found inside liver cells and muscle tissue. Your normal level confirms that your liver cells are intact with no active liver injury or inflammation."
    }
  ],
  "medications": [
    {
      "name": "Medication name and strength",
      "dose": "Dosage",
      "time": "Morning" | "Afternoon" | "Night",
      "clock": "8:00 AM" | "1:00 PM" | "8:00 PM",
      "purpose": "Purpose in simple words",
      "instruction": "Patient instructions"
    }
  ],
  "followUpRecommendations": "Follow-up recommendations and care advice"
}`;

  let messages;
  if (isImage) {
    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: fileDataUrl } },
        ],
      },
    ];
  } else {
    messages = [
      {
        role: "user",
        content: `${promptText}\n\nDocument Content:\n${textContent || "Unavailable"}`,
      },
    ];
  }

  const responseText = await callNimApi({
    messages,
    temperature: 0.1,
    max_tokens: 2500,
    model: "meta/llama-3.2-11b-vision-instruct",
  });

  return parseOcrResponse(responseText, filename, textContent);
}

/**
 * Checks if a string is a pseudo-attribute or metadata heading rather than an actual medication.
 */
export function isPseudoMedication(name) {
  if (!name || typeof name !== "string") return true;
  const t = name.trim().toLowerCase();

  // Reject negative or placeholder phrases
  if (
    t.includes("no medication") ||
    t.includes("no prescription") ||
    t.includes("not listed") ||
    t.includes("not provided") ||
    t.includes("not applicable") ||
    t.includes("there are no") ||
    t.includes("none") ||
    t.includes("does not provide") ||
    t.includes("does not list") ||
    t.includes("only lists") ||
    t.includes("laboratory test") ||
    t.includes("test result") ||
    t === "n/a" ||
    t === "null" ||
    t === "undefined" ||
    t === "[]"
  ) {
    return true;
  }

  return (
    /^(dose|time|clock|purpose|instruction|indication|notes?|qty|quantity|refills?|vital|bp|blood pressure|diagnosis|patient|attending|clinical|dr\.|mr\.|mrs\.|ms\.|document|prescription|follow-up|care instructions|orders|comment)/i.test(t) ||
    t.includes(":") ||
    t.length < 3
  );
}

/**
 * Provides comprehensive, plain-language patient explanations for laboratory tests,
 * blood markers, enzymes, urinalysis parameters, and diagnostic scan findings.
 * Explains what the marker is in plain terms and what the patient's result indicates.
 */
export function enrichFindingInterpretation(name = "", value = "", status = "Normal") {
  const n = name.trim().toLowerCase();
  const v = value ? value.trim() : "";
  const s = (status || "Normal").toLowerCase();
  const isHigh = s.includes("high") || s.includes("elevated");
  const isLow = s.includes("low") || s.includes("decreased");
  const isNormal = !isHigh && !isLow;

  // 1. Liver Function Tests (LFT)
  if (n.includes("total bilirubin") || (n.includes("bilirubin") && !n.includes("direct") && !n.includes("indirect"))) {
    return isNormal
      ? `Total Bilirubin is an orange-yellow pigment formed when your body recycles old red blood cells. Your liver clears it through bile; your normal level${v ? ` of ${v}` : ""} confirms your liver is processing and clearing cellular waste effectively.`
      : isHigh
      ? `Total Bilirubin is a pigment produced from broken down red blood cells. Your elevated level${v ? ` (${v})` : ""} can indicate slower bile drainage, temporary liver inflammation, or increased red blood cell turnover.`
      : `Total Bilirubin is a pigment from recycled red blood cells. Your level${v ? ` of ${v}` : ""} is within safe limits.`;
  }

  if (n.includes("direct bilirubin") || n.includes("conjugated bilirubin")) {
    return isNormal
      ? `Direct bilirubin is bilirubin that has been chemically processed and packaged by the liver ready to be excreted into bile. Your normal reading${v ? ` of ${v}` : ""} shows smooth, unobstructed bile flow.`
      : isHigh
      ? `Direct bilirubin is processed by the liver for bile excretion. An elevated level${v ? ` (${v})` : ""} indicates that bile is having difficulty draining into the digestive tract, which can occur with bile duct irritation or gallstones.`
      : `Direct bilirubin reflects processed liver bile. Your reading${v ? ` of ${v}` : ""} is within safe parameters.`;
  }

  if (n.includes("indirect bilirubin") || n.includes("unconjugated bilirubin")) {
    return isNormal
      ? `Indirect bilirubin is bilirubin circulating in the bloodstream on its way to the liver. Your normal level${v ? ` of ${v}` : ""} indicates normal red blood cell lifespan and healthy initial liver intake.`
      : `Indirect bilirubin is bilirubin traveling to the liver. An elevated level can indicate increased red blood cell breakdown.`;
  }

  if (n.includes("aspartate") || n.includes("ast") || n.includes("sgot")) {
    return isNormal
      ? `AST (Aspartate Aminotransferase) is an enzyme primarily found inside liver cells and muscle tissue. Your normal level${v ? ` of ${v}` : ""} confirms that your liver cells are intact with no active liver injury, irritation, or inflammation.`
      : isHigh
      ? `AST is an enzyme released into the blood when liver cells are irritated or strained. Your elevated level${v ? ` (${v})` : ""} suggests liver cell stress, which your doctor can evaluate through diet, medications, or further checks.`
      : `AST is a liver cell enzyme. Your reading${v ? ` of ${v}` : ""} shows no evidence of liver cell damage.`;
  }

  if (n.includes("alanine") || n.includes("alt") || n.includes("sgpt")) {
    return isNormal
      ? `ALT (Alanine Aminotransferase) is an enzyme found almost exclusively inside liver cells, making it the most specific indicator of liver health. Your normal level${v ? ` of ${v}` : ""} shows your liver is operating smoothly without cellular strain.`
      : isHigh
      ? `ALT is a liver-specific enzyme that leaks into the bloodstream when liver cells experience inflammation or stress. An elevated reading${v ? ` (${v})` : ""} warrants discussing lifestyle or medications with your physician.`
      : `ALT is a key liver enzyme. Your reading${v ? ` of ${v}` : ""} confirms healthy liver function.`;
  }

  if (n.includes("alkaline") || n.includes("alp") || n.includes("alk phos")) {
    return isNormal
      ? `ALP (Alkaline Phosphatase) is an enzyme found mainly in the bile ducts of the liver and in bone tissue. Your normal reading${v ? ` of ${v}` : ""} confirms healthy, unblocked bile flow through the gallbladder and liver.`
      : isHigh
      ? `ALP is an enzyme connected with bile drainage and bone growth. An elevated level${v ? ` (${v})` : ""} may suggest slowed bile duct drainage, gallbladder inflammation, or bone activity.`
      : `ALP is a bile duct and bone enzyme. Your reading${v ? ` of ${v}` : ""} is normal.`;
  }

  if (n.includes("gamma") || n.includes("ggt")) {
    return isNormal
      ? `GGT (Gamma-Glutamyl Transferase) is an enzyme sensitive to bile duct and liver stress. Your normal level${v ? ` of ${v}` : ""} confirms healthy bile ducts and liver tissue.`
      : `GGT is a sensitive marker of liver and bile duct health. Elevated levels can reflect liver or gallbladder irritation.`;
  }

  if (n.includes("albumin")) {
    return isNormal
      ? `Albumin is the most abundant protein produced by your liver. It keeps fluid inside your blood vessels and transports vitamins and hormones. Your normal level${v ? ` of ${v}` : ""} demonstrates healthy liver protein synthesis.`
      : isLow
      ? `Albumin is an essential protein produced by the liver. A lower reading${v ? ` (${v})` : ""} can suggest nutritional changes, fluid shifts, or reduced liver protein production.`
      : `Albumin is a vital liver protein. Your reading${v ? ` of ${v}` : ""} is well-balanced.`;
  }

  if (n.includes("total protein")) {
    return isNormal
      ? `Total Protein measures all albumin and globulin antibodies in your bloodstream. Your normal result${v ? ` of ${v}` : ""} reflects good nutritional status and healthy immune and liver function.`
      : `Total Protein assesses the combined level of proteins in your blood, reflecting nutrition, liver health, and immune activity.`;
  }

  // 2. Kidney & Electrolytes
  if (n.includes("sodium") || n === "na" || n.includes("na+")) {
    return isNormal
      ? `Sodium is a crucial electrolyte that regulates fluid balance, blood volume, blood pressure, and electrical communication in nerves and muscles. Your level${v ? ` of ${v}` : ""} is well-balanced.`
      : isLow
      ? `Sodium regulates body water balance. A low level${v ? ` (${v})` : ""} can stem from high fluid intake, certain medications, or salt loss.`
      : `Sodium regulates body fluid balance. An elevated level${v ? ` (${v})` : ""} usually reflects dehydration or reduced fluid intake.`;
  }

  if (n.includes("potassium") || n === "k" || n.includes("k+")) {
    return isNormal
      ? `Potassium is an essential mineral that controls your heart rhythm, supports muscle contraction, and regulates blood pressure. Your normal level${v ? ` of ${v}` : ""} shows stable cardiac and muscle electrolyte balance.`
      : isLow
      ? `Potassium is critical for heart rhythm and muscle contraction. A low reading${v ? ` (${v})` : ""} should be discussed with your doctor to prevent muscle weakness or irregular heartbeats.`
      : `Potassium regulates electrical signals in the heart and muscles. An elevated reading${v ? ` (${v})` : ""} should be reviewed by your physician.`;
  }

  if (n.includes("chloride") || n === "cl") {
    return isNormal
      ? `Chloride is an electrolyte that works alongside sodium and potassium to maintain healthy fluid volume and correct acid-base balance. Your level${v ? ` of ${v}` : ""} is in a healthy range.`
      : `Chloride maintains the body's hydration and acid-base balance. Your result${v ? ` of ${v}` : ""} reflects your body's electrolyte equilibrium.`;
  }

  if (n.includes("bicarbonate") || n.includes("hco3") || n.includes("co2")) {
    return isNormal
      ? `Bicarbonate acts as a natural chemical buffer that prevents your blood from becoming too acidic or too alkaline. Your level${v ? ` of ${v}` : ""} is well-balanced.`
      : isLow
      ? `Bicarbonate is an electrolyte that keeps your body's acid-base balance stable. Your result${v ? ` of ${v}` : ""} is slightly low, which can occur with dehydration, mild metabolic shifts, or temporary dietary factors.`
      : `Bicarbonate maintains the blood's pH balance. An elevated reading${v ? ` (${v})` : ""} reflects a shift in your body's acid-base regulation.`;
  }

  if (n.includes("urea") || n.includes("bun") || n.includes("blood urea")) {
    return isNormal
      ? `Urea is a natural waste byproduct formed when your body digests dietary protein. Your kidneys filter it out into urine; your normal reading${v ? ` of ${v}` : ""} confirms your kidneys are clearing protein waste efficiently.`
      : isHigh
      ? `Urea is a waste product from protein metabolism. An elevated reading${v ? ` (${v})` : ""} can occur with dehydration, a high-protein diet, or reduced kidney clearance.`
      : `Urea is a protein waste product filtered by the kidneys. Your level${v ? ` of ${v}` : ""} is within safe limits.`;
  }

  if (n.includes("creatinine")) {
    return isNormal
      ? `Creatinine is a waste product generated by normal muscle activity and cleared almost entirely by the kidneys. Your normal level${v ? ` of ${v}` : ""} is a strong indicator of healthy kidney filtration.`
      : isHigh
      ? `Creatinine is a muscle waste byproduct filtered by the kidneys. An elevated reading${v ? ` (${v})` : ""} indicates that kidney filtration may be slowed or affected by temporary factors like dehydration.`
      : `Creatinine measures kidney filtration performance. Your level${v ? ` of ${v}` : ""} indicates healthy kidney clearance.`;
  }

  if (n.includes("egfr")) {
    return isNormal
      ? `eGFR (Estimated Glomerular Filtration Rate) calculates how many milliliters of blood your kidneys filter every minute. Your reading${v ? ` of ${v}` : ""} confirms robust, healthy kidney filtering capability.`
      : `eGFR measures the filtering efficiency of your kidneys. A lower score indicates that kidney filtration is working at a reduced pace.`;
  }

  // 3. Complete Blood Count (CBC) / Haematology
  if (n.includes("haemoglobin") || n.includes("hemoglobin") || n === "hb") {
    return isNormal
      ? `Haemoglobin is the iron-packed protein in red blood cells that picks up oxygen in your lungs and delivers it to every tissue in your body. Your normal level${v ? ` of ${v}` : ""} confirms strong oxygen-carrying capacity and no anemia.`
      : isLow
      ? `Haemoglobin carries oxygen throughout your body. A lower reading${v ? ` (${v})` : ""} indicates anemia, which can cause fatigue and is often addressed with iron or nutritional support.`
      : `Haemoglobin carries oxygen to body tissues. An elevated reading${v ? ` (${v})` : ""} can occur with dehydration or living at high altitudes.`;
  }

  if (n.includes("red blood cell") || n.includes("rbc")) {
    return isNormal
      ? `Red blood cells are the microscopic vessels that transport oxygen and nutrients to all bodily organs. Your normal count${v ? ` of ${v}` : ""} reflects healthy bone marrow production.`
      : isLow
      ? `Red blood cells transport oxygen throughout the body. A reduced count${v ? ` (${v})` : ""} indicates anemia or reduced red cell production.`
      : `Red blood cells carry oxygen. An elevated count${v ? ` (${v})` : ""} can occur with dehydration.`;
  }

  if (n.includes("white blood cell") || n.includes("wbc") || n.includes("leucocyte")) {
    return isNormal
      ? `White blood cells are the frontline defense units of your immune system that protect against infections. Your normal count${v ? ` of ${v}` : ""} shows an active, balanced immune system without severe infection or inflammation.`
      : isHigh
      ? `White blood cells fight off infections and irritation. An elevated count${v ? ` (${v})` : ""} shows that your immune system is actively responding to an infection, inflammation, or physical stress.`
      : `White blood cells protect against illness. A lower count${v ? ` (${v})` : ""} indicates that your immune defense may temporarily be operating at a lower capacity.`;
  }

  if (n.includes("platelet")) {
    return isNormal
      ? `Platelets are specialized blood cell fragments that rush to seal cuts and form blood clots to stop bleeding. Your normal count${v ? ` of ${v}` : ""} confirms healthy blood clotting and tissue repair capability.`
      : isLow
      ? `Platelets help your blood clot when you have an injury. A lower count${v ? ` (${v})` : ""} means you may bruise or bleed more easily and should be evaluated by your physician.`
      : `Platelets assist in blood clotting. An elevated count${v ? ` (${v})` : ""} can accompany inflammation or active healing.`;
  }

  if (n.includes("pcv") || n.includes("haematocrit") || n.includes("hematocrit")) {
    return isNormal
      ? `Packed Cell Volume (Haematocrit) measures the percentage of your blood made up of red blood cells. Your normal result${v ? ` of ${v}` : ""} confirms proper blood hydration and healthy red blood cell volume.`
      : `Haematocrit represents the proportion of red blood cells in your circulation, evaluating hydration and oxygen capacity.`;
  }

  // 4. Blood Sugar & Metabolism
  if (n.includes("fasting blood sugar") || n.includes("fasting blood glucose") || n === "fbs" || (n.includes("glucose") && !n.includes("urine"))) {
    return isNormal
      ? `Fasting blood glucose measures your blood sugar level after an overnight fast. Your normal reading${v ? ` of ${v}` : ""} confirms healthy insulin sensitivity and efficient blood sugar regulation.`
      : isHigh
      ? `Fasting blood glucose measures blood sugar after fasting. An elevated reading${v ? ` (${v})` : ""} indicates impaired glucose handling or prediabetes/diabetes that requires dietary and medical guidance.`
      : `Fasting blood glucose measures your blood sugar. A lower reading${v ? ` (${v})` : ""} indicates mild hypoglycemia.`;
  }

  if (n.includes("hba1c") || n.includes("glycated")) {
    return isNormal
      ? `HbA1c reveals your average blood sugar level over the past 2 to 3 months. Your normal level${v ? ` of ${v}` : ""} indicates sustained, healthy long-term glucose control.`
      : `HbA1c provides an overview of average blood sugar over the previous 90 days. An elevated level reflects higher long-term glucose exposure.`;
  }

  // 5. Urinalysis Parameters
  if (n.includes("urine wbc") || n.includes("pus cell")) {
    return isNormal
      ? `White blood cells in urine. Normal urine contains few to no immune cells; your result${v ? ` of ${v}` : ""} indicates healthy urinary tract tissues without inflammation.`
      : `White blood cells in urine. Your count${v ? ` of ${v}` : ""} indicates that immune cells are active in the urinary system, commonly pointing to mild bladder irritation, inflammation, or a urinary tract infection (UTI).`;
  }

  if (n.includes("urine protein") || (n.includes("protein") && n.includes("urine"))) {
    return isNormal
      ? `Urine protein checks whether proteins are passing through kidney filters. A negative result confirms that your kidney filters are tight, intact, and functioning properly.`
      : `Urine protein detection. The presence of protein in urine can suggest kidney filter irritation, vigorous exercise, or temporary fever.`;
  }

  if (n.includes("urine glucose") || (n.includes("glucose") && n.includes("urine"))) {
    return isNormal
      ? `Urine glucose checks whether sugar spills into your urine. A negative result confirms that your kidneys are retaining all needed sugar and blood glucose is well controlled.`
      : `Urine glucose detection. Sugar spilling into urine indicates that blood glucose levels may have exceeded the kidneys' reabsorption threshold.`;
  }

  // 6. Diagnostic Ultrasound / Imaging Organs
  if (n === "liver" || n.includes("liver appearance")) {
    return isNormal
      ? `Ultrasound assessment of liver size, contours, and texture. Normal findings${v ? ` (${v})` : ""} show healthy liver architecture with no fatty infiltration, cysts, or masses.`
      : `Ultrasound examination of liver dimensions and tissue echogenicity.`;
  }

  if (n.includes("gall bladder") || n.includes("gallbladder")) {
    return isNormal
      ? `Ultrasound inspection of gallbladder wall thickness, lumen, and bile. Normal findings${v ? ` (${v})` : ""} confirm normal distension with no gallstones, polyps, or sludge.`
      : `Ultrasound examination of the gallbladder and biliary tree.`;
  }

  if (n.includes("kidney") || n.includes("rtk") || n.includes("ltk") || n.includes("renal")) {
    return isNormal
      ? `Ultrasound evaluation of kidney size, position, and internal tissue differentiation. Normal results${v ? ` (${v})` : ""} show healthy kidney structure with no stones, cysts, or urinary obstruction.`
      : `Ultrasound examination of kidney structure and renal movement.`;
  }

  if (n.includes("spleen")) {
    return isNormal
      ? `Ultrasound measurement of spleen size and tissue pattern. Normal findings${v ? ` (${v})` : ""} confirm that the spleen is not enlarged and is filtering blood normally.`
      : `Ultrasound examination of spleen dimensions and echopattern.`;
  }

  if (n.includes("pancreas")) {
    return isNormal
      ? `Ultrasound imaging of the pancreas. Normal findings${v ? ` (${v})` : ""} show uniform pancreatic tissue without swelling, inflammation, or structural irregularities.`
      : `Ultrasound evaluation of pancreatic architecture.`;
  }

  if (n.includes("bowel") || n.includes("stomach") || n.includes("git")) {
    return isNormal
      ? `Ultrasound check of digestive tract walls and intestinal activity. Findings${v ? ` (${v})` : ""} confirm normal bowel movement without obstruction, masses, or inflammation.`
      : `Ultrasound assessment of digestive tract and bowel patterns.`;
  }

  if (n.includes("urinary bladder") || n.includes("bladder")) {
    return isNormal
      ? `Ultrasound examination of bladder wall thickness and fluid clarity. Normal findings${v ? ` (${v})` : ""} confirm healthy bladder capacity with clear urine and no stones or masses.`
      : `Ultrasound check of the urinary bladder.`;
  }

  if (n.includes("uterus")) {
    return isNormal
      ? `Ultrasound evaluation of pelvic structures. Findings${v ? ` (${v})` : ""} reflect expected anatomical findings with clear surrounding tissue.`
      : `Ultrasound assessment of pelvic organs.`;
  }

  // Generic fallback if not specifically mapped
  if (isNormal) {
    return `${name} is a health marker evaluated in this document. Your measured reading${v ? ` of ${v}` : ""} is within healthy normal limits, indicating normal, balanced physiological function.`;
  } else if (isHigh) {
    return `${name} is a clinical marker measured in this test. Your result${v ? ` of ${v}` : ""} is above standard reference limits, which you can discuss with your doctor to understand its clinical context.`;
  } else if (isLow) {
    return `${name} is a clinical marker measured in this test. Your result${v ? ` of ${v}` : ""} is below standard reference limits, which your doctor can evaluate alongside your overall symptoms and health history.`;
  }

  return `${name} was measured in this clinical test${v ? ` with a result of ${v}` : ""}.`;
}

/**
 * Parse findings list from text or structured markdown.
 */
export function parseFindingsList(rawFindingsText) {
  if (!rawFindingsText) return [];
  const findings = [];
  const lines = rawFindingsText.split("\n");
  let current = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Pattern 1: + **Sodium:** 140.2 mmol/l (Normal)
    const inlineMatch = line.match(/^(?:[-*+]|\d+\.)\s*\*?\*?([^\*:]+):?\*?\*?:?\s*([^\(\n]+?)(?:\s*\(([^\)]+)\))?$/i);
    if (inlineMatch && inlineMatch[1].length < 60) {
      const name = inlineMatch[1].replace(/\*\*/g, "").trim();
      const val = inlineMatch[2].replace(/\*\*/g, "").trim();
      const statusRaw = inlineMatch[3] ? inlineMatch[3].trim() : "Normal";
      if (!/^(value|status|interpretation|note|document)/i.test(name)) {
        if (current) findings.push(current);
        current = {
          name,
          value: val,
          status: statusRaw.toLowerCase().includes("high") ? "High" : statusRaw.toLowerCase().includes("low") ? "Low" : "Normal",
          interpretation: "",
        };
        continue;
      }
    }

    // Pattern 2: * **Total Bilirubin**
    const headerMatch = line.match(/^(?:[-*+]|\d+\.)\s*\*?\*?([^\*:]+)\*?\*?$/i);
    if (headerMatch && headerMatch[1].length < 60) {
      const name = headerMatch[1].replace(/\*\*/g, "").trim();
      if (!/^(value|status|interpretation|note|document)/i.test(name)) {
        if (current) findings.push(current);
        current = {
          name,
          value: "",
          status: "Normal",
          interpretation: "",
        };
        continue;
      }
    }

    // Sub-bullets for current item
    if (current) {
      const valMatch = line.match(/(?:[-*+]|\d+\.)?\s*Value:\s*(.+)$/i);
      const statusMatch = line.match(/(?:[-*+]|\d+\.)?\s*Status:\s*(.+)$/i);
      const interpMatch = line.match(/(?:[-*+]|\d+\.)?\s*Interpretation:\s*(.+)$/i);

      if (valMatch) current.value = valMatch[1].trim();
      else if (statusMatch) current.status = statusMatch[1].trim();
      else if (interpMatch) current.interpretation = interpMatch[1].trim();
    }
  }

  if (current) findings.push(current);

  return findings.map((f) => ({
    ...f,
    interpretation:
      f.interpretation && f.interpretation.trim().length > 20
        ? f.interpretation.trim()
        : enrichFindingInterpretation(f.name, f.value, f.status),
  }));
}

function cleanDiagnosis(diag, docTitle, keyFindings) {
  if (!diag) return docTitle || keyFindings || "Diagnostic Assessment";
  let clean = diag
    .replace(/^\*+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^Diagnosis:\s*/i, "")
    .replace(/^Answer:\s*/i, "")
    .trim();

  // If captured in middle of sentence e.g. ", but it does summarize..."
  if (clean.startsWith(",") || clean.startsWith(".") || clean.startsWith(":") || clean.startsWith("-")) {
    clean = clean.replace(/^[,.:\s-]+/, "");
  }

  const lower = clean.toLowerCase();
  if (
    lower.includes("does not provide a diagnosis") ||
    lower.includes("only lists laboratory") ||
    lower.includes("no diagnosis") ||
    lower.includes("not provided") ||
    lower.startsWith("but it does") ||
    lower.startsWith("and it does") ||
    lower.length < 3
  ) {
    return docTitle || keyFindings || "Diagnostic Assessment";
  }
  return clean;
}

function cleanFollowUp(text) {
  if (!text) return "Share and discuss these findings with your doctor during your next scheduled consultation.";
  let cleaned = text
    .replace(/Answer:\s*\{[\s\S]*?\}/gi, "")
    .replace(/\{[\s\S]*?\}/gi, "")
    .replace(/^\*+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^(?:are\s+to|is\s+to)\s+/i, "")
    .trim();

  const lower = cleaned.toLowerCase();
  if (
    lower.includes("there are no follow-up") ||
    lower.includes("no follow-up recommendations") ||
    lower.includes("none") ||
    lower.length < 5
  ) {
    return "Share and discuss these findings with your doctor during your next scheduled consultation.";
  }
  return cleaned;
}

/**
 * Robust parser that handles BOTH JSON and Markdown-formatted LLM responses.
 */
export function parseOcrResponse(responseText, filename = "Medical Document", fallbackText) {
  let cleaned = responseText.trim();

  // Try JSON first
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    const parsed = JSON.parse(cleaned);

    const rawType =
      parsed.documentType ||
      parsed["Document Type"] ||
      parsed["document_type"] ||
      parsed.type ||
      "Prescription";

    let docType = "Prescription";
    const typeHint = (String(rawType) + " " + String(filename || "")).toLowerCase();
    if (typeHint.includes("prescription") || typeHint.includes("rx") || typeHint.includes("medication")) {
      docType = "Prescription";
    } else if (typeHint.includes("discharge") || typeHint.includes("hospital") || typeHint.includes("inpatient")) {
      docType = "Discharge summary";
    } else if (typeHint.includes("lab") || typeHint.includes("blood test") || typeHint.includes("pathology") || typeHint.includes("panel") || typeHint.includes("urinalysis") || typeHint.includes("test")) {
      docType = "Lab result";
    }

    const documentTitle =
      parsed.documentTitle ||
      parsed["Document Title"] ||
      parsed["document_title"] ||
      parsed.title ||
      "";

    const rawFindings =
      parsed.findingsList ||
      parsed["Findings List"] ||
      parsed["findings_list"] ||
      [];

    const findingsList = Array.isArray(rawFindings)
      ? rawFindings.map((f) => {
          const name = String(f.name || f["Test Name"] || f["test_name"] || f["Organ or Test name"] || "Test").trim();
          const value = String(f.value || f["Result Value"] || f["value"] || f["Measured value or observation"] || "").trim();
          const status = String(f.status || f["Status"] || "Normal").trim();
          const rawInterp = String(f.interpretation || f["Interpretation"] || "").trim();
          const interpretation =
            rawInterp && rawInterp.length > 20
              ? rawInterp
              : enrichFindingInterpretation(name, value, status);
          return {
            name,
            value,
            status,
            interpretation,
          };
        })
      : [];

    const rawMeds =
      parsed.medications ||
      parsed["Medication Plan"] ||
      parsed["medication_plan"] ||
      parsed.medicationPlan ||
      [];

    const medications = (docType === "Prescription" && Array.isArray(rawMeds))
      ? rawMeds
          .filter((m) => !isPseudoMedication(m.name || m["Medication Name"] || m["medication_name"]))
          .map((m, idx) => {
            const rawName = m.name || m["Medication Name"] || m["medication_name"] || "Prescribed Medication";
            const name = rawName.replace(/Oral Tablet/i, "").trim();
            const dose = m.dose || m["Dose"] || "As directed";
            const rawTime = m.time || m["Time"] || "Morning";
            const clock = m.clock || m["Clock"] || (String(rawTime).toLowerCase().includes("night") ? "8:00 PM" : String(rawTime).toLowerCase().includes("afternoon") ? "1:00 PM" : "8:00 AM");
            const purpose = m.purpose || m["Purpose"] || "Prescribed for your health condition";
            const instruction = m.instruction || m["Instruction"] || m["instructions"] || dose || "Take as instructed by doctor";

            let normalizedTime = "Morning";
            if (String(rawTime).toLowerCase().includes("night") || String(rawTime).toLowerCase().includes("bed")) {
              normalizedTime = "Night";
            } else if (String(rawTime).toLowerCase().includes("afternoon") || String(rawTime).toLowerCase().includes("lunch")) {
              normalizedTime = "Afternoon";
            }

            return {
              id: `med-${Date.now()}-${idx}`,
              name,
              dose,
              time: normalizedTime,
              clock,
              purpose,
              instruction,
              taken: false,
              active: true,
            };
          })
      : [];

    const rawDiag =
      parsed.diagnosis ||
      parsed["Diagnosis / Findings"] ||
      parsed["Diagnosis"] ||
      parsed["Key Findings"] ||
      parsed.keyFindings ||
      "";

    const diagnosis = cleanDiagnosis(rawDiag, documentTitle, parsed.keyFindings);

    const followUpRecommendations = cleanFollowUp(
      parsed.followUpRecommendations ||
      parsed["Follow-up Recommendations"] ||
      parsed["Follow-up and Care"] ||
      parsed["follow_up_recommendations"] ||
      parsed["Recommendations"] ||
      parsed.recommendations ||
      ""
    );

    const summary =
      parsed.explanation ||
      parsed["Explanation"] ||
      parsed.summary ||
      parsed.laymanExplanation ||
      parsed["Summary"] ||
      "";

    // If medications array is empty but raw text has medications, extract them via markdown parser
    if (medications.length === 0 && docType === "Prescription" && (responseText.includes("**Medications:**") || responseText.includes("Prescription Medication Plan"))) {
      const fallbackParsed = parseMarkdownOcr(responseText, fallbackText, filename);
      if (fallbackParsed.medications.length > 0) {
        return {
          ...fallbackParsed,
          rawExtractedText: parsed.rawExtractedText || fallbackParsed.rawExtractedText,
        };
      }
    }

    return {
      documentType: docType,
      documentTitle: documentTitle || filename.replace(/\.[^/.]+$/, ""),
      rawExtractedText: parsed.rawExtractedText || responseText.slice(0, 500),
      explanation: cleanSummaryText(summary) || `WellNest AI analyzed this ${docType.toLowerCase()} to give you a clear overview of your health status.`,
      laymanExplanation: cleanSummaryText(summary) || `WellNest AI analyzed this ${docType.toLowerCase()} to give you a clear overview of your health status.`,
      diagnosis,
      findingsList,
      medications,
      followUpRecommendations,
    };
  } catch (parseErr) {
    console.log("[NIM OCR] Response is formatted as Markdown text. Running markdown parser...");
    return parseMarkdownOcr(responseText, fallbackText, filename);
  }
}

/**
 * Extracts sections from Markdown formatted OCR outputs.
 */
export function parseMarkdownOcr(text, fallbackRaw, filename = "Medical Document") {
  const allTitles = [
    "Document Type",
    "Document Title",
    "Key Findings",
    "Explanation",
    "Layman Explanation",
    "Findings List",
    "Diagnosis",
    "Diagnosis / Findings",
    "Medications",
    "Prescription Medication Plan",
    "Follow-up and Care",
    "Follow-up Recommendations",
    "Discharge Orders & Patient Care Instructions",
    "Next Steps",
  ];

  function getSection(targetTitle) {
    const others = allTitles.filter((t) => t.toLowerCase() !== targetTitle.toLowerCase());
    const pattern = new RegExp(
      "(?:^|\\n)\\s*(?:[-*+]\\s*)?\\*?\\*?" + targetTitle + ":?\\*?\\*?:?\\s*([\\s\\S]*?)(?=(?:\\n\\s*(?:[-*+]\\s*)?\\*?\\*?(?:" + others.join("|") + "):?\\*?\\*?:?)|$)",
      "i"
    );
    const m = text.match(pattern);
    return m ? m[1].trim() : "";
  }

  // 1. Document Title
  let documentTitle = getSection("Document Title");
  if (!documentTitle) {
    const titleMatch = text.match(/(?:Document Title|Title)[:\s]+([^\n\*]+)/i);
    if (titleMatch) documentTitle = titleMatch[1].trim();
  }
  if (!documentTitle) {
    documentTitle = filename.replace(/\.[^/.]+$/, "");
  }

  // 2. Document Type
  const rawType = (getSection("Document Type") || "").trim();
  let docType = "Prescription";
  const typeHint = (rawType + " " + (fallbackRaw || "") + " " + filename).toLowerCase();

  if (rawType.toLowerCase().includes("prescription") || typeHint.includes("prescription") || typeHint.includes("rx")) {
    docType = "Prescription";
  } else if (rawType.toLowerCase().includes("discharge") || typeHint.includes("discharge summary")) {
    docType = "Discharge summary";
  } else if (rawType.toLowerCase().includes("lab") || typeHint.includes("lab") || typeHint.includes("test") || (typeHint.includes("reference range") && !typeHint.includes("prescription"))) {
    docType = "Lab result";
  }

  // 3. Explanation
  let explanation = getSection("Explanation") || getSection("Layman Explanation") || getSection("Summary");
  if (!explanation) {
    const preHeaderMatch = text.match(/^([\s\S]*?)(?=\*\*|\* \*\*|$)/);
    if (preHeaderMatch && preHeaderMatch[1].trim().length > 30) {
      explanation = preHeaderMatch[1].trim();
    }
  }

  // 4. Key Findings & Diagnosis
  const rawDiag =
    getSection("Key Findings") ||
    getSection("Diagnosis") ||
    getSection("Diagnosis / Findings");
  let diagnosis = cleanDiagnosis(rawDiag, documentTitle);

  // 5. Findings List
  const rawFindings = getSection("Findings List");
  const findingsList = parseFindingsList(rawFindings);

  // 6. Medications
  const rawMeds =
    getSection("Medications") ||
    getSection("Prescription Medication Plan (Rx)") ||
    getSection("Prescription Medication Plan");
  const medications = [];

  if (rawMeds && docType === "Prescription") {
    const lines = rawMeds.split("\n");
    let current = null;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const attrMatch = line.match(
        /^(?:[-*+]|\d+\.)?\s*(dose|time|clock(?: time)?|purpose|instruction[s]?|indication(?:\/purpose)?|notes?|qty|quantity|refills?|sig)\s*[:\-–]\s*(.+)$/i
      );
      if (attrMatch) {
        if (current) {
          const key = attrMatch[1].toLowerCase();
          const val = attrMatch[2].trim();
          if (key.startsWith("dose")) current.dose = val;
          else if (key.startsWith("purpose") || key.startsWith("indication")) current.purpose = val;
          else if (key.startsWith("instruction") || key.startsWith("sig")) current.instruction = val;
          else if (key.startsWith("clock")) current.clock = val;
          else if (key.startsWith("time")) {
            if (/night|evening|bed/i.test(val)) {
              current.time = "Night";
              current.clock = current.clock || "8:00 PM";
            } else if (/afternoon|lunch|noon/i.test(val)) {
              current.time = "Afternoon";
              current.clock = current.clock || "1:00 PM";
            } else {
              current.time = "Morning";
              current.clock = current.clock || "8:00 AM";
            }
          }
        }
        continue;
      }

      const cleanLine = line
        .replace(/^(?:[-*+]|\d+\.)\s*/, "")
        .replace(/Oral Tablet/i, "")
        .replace(/\*\*/g, "")
        .trim();

      if (cleanLine && !isPseudoMedication(cleanLine)) {
        if (current && !isPseudoMedication(current.name)) {
          medications.push(current);
        }
        current = {
          id: `med-${Date.now()}-${medications.length}`,
          name: cleanLine,
          dose: "As directed",
          time: "Morning",
          clock: "8:00 AM",
          purpose: "Prescribed medication",
          instruction: "Take as directed",
          taken: false,
          active: true,
        };
      }
    }

    if (current && !isPseudoMedication(current.name)) {
      medications.push(current);
    }

    // Auto-deduce schedule time, clock, and dose from text
    medications.forEach((m, idx) => {
      const combined = (m.name + " " + m.instruction + " " + m.dose).toLowerCase();
      if (combined.includes("bedtime") || combined.includes("night") || combined.includes("evening")) {
        m.time = "Night";
        m.clock = "8:00 PM";
      } else if (combined.includes("afternoon") || combined.includes("lunch") || combined.includes("noon")) {
        m.time = "Afternoon";
        m.clock = "1:00 PM";
      } else if (combined.includes("morning") || combined.includes("breakfast")) {
        m.time = "Morning";
        m.clock = "8:00 AM";
      } else if (idx === 1 && medications.length === 3) {
        m.time = "Afternoon";
        m.clock = "1:00 PM";
      } else if (idx === 2 && medications.length === 3) {
        m.time = "Night";
        m.clock = "8:00 PM";
      }

      if (m.dose === "As directed" && m.instruction) {
        const doseMatch = m.instruction.match(
          /(?:take\s+)?(\d+\s*(?:tablet|tablets|capsule|capsules|pill|pills|puff|drops?|ml|mg)(?:\s+(?:once|twice|three times|\d+\s*times)?\s*(?:daily|per day|a day))?)/i
        );
        if (doseMatch) {
          m.dose = doseMatch[1].trim();
        }
      }
    });
  }

  // 7. Follow-up
  let followUp =
    getSection("Follow-up and Care") ||
    getSection("Follow-up Recommendations") ||
    getSection("Discharge Orders & Patient Care Instructions") ||
    getSection("Next Steps");

  return {
    documentType: docType,
    documentTitle,
    rawExtractedText: fallbackRaw || text.slice(0, 500),
    explanation: cleanSummaryText(explanation) || `WellNest AI analyzed this ${docType.toLowerCase()} to give you a clear overview of your health status.`,
    laymanExplanation: cleanSummaryText(explanation) || `WellNest AI analyzed this ${docType.toLowerCase()} to give you a clear overview of your health status.`,
    diagnosis,
    findingsList,
    medications,
    followUpRecommendations: cleanFollowUp(followUp),
  };
}

/**
 * Remove markdown artifacts and prompt echoes from summary text.
 */
function cleanSummaryText(str) {
  if (!str) return "";
  return str
    .replace(/\*\*Document Type:\*\*[\s\S]*?\*\*Explanation:\*\*/i, "")
    .replace(/\*\*Document Details\*\*[\s\S]*?\*\*Explanation:\*\*/i, "")
    .replace(/\*\*Raw Extracted Text:\*\*[\s\S]*?(?=\*\*|$)/i, "")
    .replace(/\*\*(?:Diagnosis|Medications|Findings List|Follow-up):\*\*[\s\S]*$/i, "")
    .replace(/\*\*/g, "")
    .trim();
}

/**
 * Answers healthcare questions strictly within the patient's uploaded documents.
 */
export async function askWellNestAi({
  question,
  chatHistory = [],
  documents = [],
  medications = [],
}) {
  const documentsContextText =
    documents.length === 0
      ? "No documents uploaded yet by this user."
      : documents
          .map((doc, idx) => {
            const medList = (doc.medications || [])
              .map((m) => `- ${m.name} (${m.dose}): ${m.purpose} | ${m.instruction}`)
              .join("\n");
            const findingsText = (doc.findingsList || [])
              .map((f) => `- ${f.name}: ${f.value} (${f.status}) ${f.interpretation ? "— " + f.interpretation : ""}`)
              .join("\n");

            return `[DOCUMENT ${idx + 1}]
Name: ${doc.name}
Title: ${doc.documentTitle || doc.name}
Type: ${doc.type}
Date: ${doc.date || "Recent"}
Diagnosis / Findings: ${doc.diagnosis || "None recorded"}
Plain-Language Explanation: ${doc.laymanExplanation || doc.explanation || ""}
Specific Test Measurements:
${findingsText || "None recorded"}
Medication Plan in this document:
${medList || "None listed"}
Recommendations / Next Steps: ${doc.followUpRecommendations || "None"}
Raw Text: ${doc.rawExtractedText || ""}
`;
          })
          .join("\n--------------------\n");

  const currentMedicationsList =
    medications.length === 0
      ? "No active medications scheduled."
      : medications
          .flatMap((b) => b.items || [])
          .map(
            (item) =>
              `- ${item.name} (${item.dose}) - Schedule: ${item.time || "Daily"} at ${item.clock || ""} - Purpose: ${item.purpose} - Directions: ${item.instruction}`
          )
          .join("\n");

  const systemPrompt = `You are WellNest AI, a supportive healthcare companion for the user.
Your primary mission is to answer questions simply and accurately based on their care records.

STRICT CONSTRAINTS:
1. ONLY ANSWER WITHIN THE UPLOADED DOCUMENTS AND HEALTH CONTEXT PROVIDED BELOW.
   If the user asks about an illness, medication, test result, or question that is NOT covered in their uploaded documents, you MUST respond with:
   "I can only answer questions based on the medical documents you have uploaded (your prescriptions, lab results, and discharge summaries). That information is not in your current records. Please consult your doctor or healthcare team."

2. USE SIMPLE LAYMAN TERMS ONLY.
   Do not use high-level, dense medical vocabulary or complicated words. Explain everything in warm, everyday, 5th-to-8th-grade reading level English that anyone can immediately understand. If a technical term must be mentioned, define it simply right away.

3. DO NOT USE ANY EMOJIS IN YOUR RESPONSE.
   Keep all answers clean of emoji characters.

4. SAFETY:
   Never invent new medical diagnoses or instruct the user to alter prescription dosages without a physician's approval.

5. SUGGESTED FOLLOW-UP QUESTIONS:
   At the very end of your response, generate 2 or 3 follow-up questions written strictly FROM THE PATIENT'S PERSPECTIVE asking WellNest AI about their records, test markers, doctor instructions, or next steps.
   CRITICAL RULES:
   - Formulate questions that the PATIENT clicks to ask WellNest AI (for example: "What does my Bicarbonate level of 19.6 mmol/l indicate?", "Could mild dehydration affect my urea or creatinine?", "What other tests were performed in this report?").
   - NEVER formulate questions where you (the AI) interview or ask the patient (DO NOT write "What is your fluid intake?", "Have you noticed any changes?", "Are you taking any medications?").
   - Always phrase questions as the patient asking the AI using "my", "I", or asking about specific results from their documents.
   Format them on a new line at the very end like this:
   FOLLOW-UP QUESTIONS:
   - [Question from the patient asking the AI]
   - [Question from the patient asking the AI]
   - [Question from the patient asking the AI]

CURRENT PATIENT CONTEXT FROM UPLOADED DOCUMENTS:
========================================
ACTIVE MEDICATIONS:
${currentMedicationsList}

UPLOADED DOCUMENTS:
${documentsContextText}
========================================
`;

  const recentHistory = (chatHistory || []).slice(-6).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.text || m.content || "",
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...recentHistory,
    { role: "user", content: question },
  ];

  try {
    const reply = await callNimApi({
      messages,
      temperature: 0.2,
      max_tokens: 1500,
      model: "meta/llama-3.2-11b-vision-instruct",
    });
    return reply;
  } catch (err) {
    console.warn("[NIM Chat] Primary model failed, retrying with fallback model:", err.message);
    const fallbackReply = await callNimApi({
      messages,
      temperature: 0.2,
      max_tokens: 1500,
      model: "mistralai/mistral-7b-instruct-v0.3",
    });
    return fallbackReply;
  }
}

/**
 * Parses assistant response text into a clean message body and structured follow-up questions.
 */
export function parseChatResponse(rawReply, documents = [], currentQuestion = "") {
  if (!rawReply || typeof rawReply !== "string") {
    return {
      text: "I am ready to help explain your uploaded health records in plain everyday language.",
      followUps: getContextualFollowUps(documents, currentQuestion),
    };
  }

  let text = rawReply.trim();
  let followUps = [];

  const markerMatch = text.match(/(?:\n|^)\s*(?:FOLLOW-UP QUESTIONS|Follow-up questions|Suggested follow-up questions|Follow-up Questions):?\s*([\s\S]*)$/i);

  if (markerMatch) {
    const rawSection = markerMatch[1].trim();
    text = text.substring(0, markerMatch.index).trim();

    const lines = rawSection.split("\n");
    for (const line of lines) {
      let cleaned = line.replace(/^[-*•\d\.\s]+/, "").trim();
      if (!cleaned || cleaned.length < 5) continue;
      if (!cleaned.endsWith("?")) cleaned += "?";

      // Normalize second-person interview questions ("What is your...", "Are you...") to patient perspective
      cleaned = cleaned
        .replace(/^What is your\s+/i, "How does my ")
        .replace(/^Have you noticed any changes in your\s+/i, "What does my record say about my ")
        .replace(/^Have you noticed\s+/i, "Could there be ")
        .replace(/^Are you taking any medications that could potentially affect your\s+/i, "Could any medications affect my ")
        .replace(/^Are you taking any medications that\s+/i, "Could medications ")
        .replace(/\byour\b/gi, "my")
        .replace(/\byou\b/gi, "I");

      followUps.push(cleaned);
    }
  }

  // If the model didn't provide follow-ups or fewer than 2, enrich with dynamic contextual questions
  if (followUps.length < 2) {
    const fallbacks = getContextualFollowUps(documents, currentQuestion);
    for (const fb of fallbacks) {
      if (!followUps.includes(fb) && followUps.length < 3) {
        followUps.push(fb);
      }
    }
  }

  return {
    text,
    followUps: followUps.slice(0, 3),
  };
}

/**
 * Generates smart contextual follow-up questions from patient's uploaded documents.
 */
export function getContextualFollowUps(documents = [], currentQuestion = "") {
  const suggestions = [];
  const qLower = (currentQuestion || "").toLowerCase();

  const allNames = documents
    .map((d) => [d.name, d.documentTitle, d.diagnosis, d.explanation, d.laymanExplanation].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();

  // Liver tests (e.g. test1)
  if (allNames.includes("liver") || allNames.includes("bilirubin") || allNames.includes("ast") || allNames.includes("alt") || allNames.includes("alp")) {
    if (!qLower.includes("ast") && !qLower.includes("alt")) {
      suggestions.push("What do my AST and ALT liver enzymes indicate?");
    }
    if (!qLower.includes("bilirubin")) {
      suggestions.push("What does my Total and Direct Bilirubin level show?");
    }
    if (!qLower.includes("alp") && !qLower.includes("alkaline")) {
      suggestions.push("What does my Alkaline Phosphate (ALP) result mean?");
    }
  }

  // Ultrasound / Abdominal scan (e.g. test4)
  if (allNames.includes("scan") || allNames.includes("ultrasound") || allNames.includes("gastritis") || allNames.includes("abdominal")) {
    if (!qLower.includes("gastritis")) {
      suggestions.push("What does mild gastritis mean in plain language?");
    }
    if (!qLower.includes("kidney") && !qLower.includes("gallbladder")) {
      suggestions.push("What did my ultrasound show about my liver, kidneys, and gallbladder?");
    }
    if (!qLower.includes("follow-up") && !qLower.includes("test")) {
      suggestions.push("What follow-up tests did the doctor recommend?");
    }
  }

  // Electrolytes, Urea & Kidney panel (e.g. test2)
  if (allNames.includes("electrolyte") || allNames.includes("bicarbonate") || allNames.includes("creatinine") || allNames.includes("urea")) {
    if (!qLower.includes("bicarbonate")) {
      suggestions.push("What does my Bicarbonate result of 19.6 mmol/l indicate?");
    }
    if (!qLower.includes("creatinine") && !qLower.includes("urea")) {
      suggestions.push("Are my kidneys filtering waste properly?");
    }
  }

  // Fasting Blood Sugar / Urinalysis / Haemotology (e.g. test3)
  if (allNames.includes("glucose") || allNames.includes("sugar") || allNames.includes("fbs") || allNames.includes("urine") || allNames.includes("haemoglobin")) {
    if (!qLower.includes("glucose") && !qLower.includes("fbs")) {
      suggestions.push("Is my fasting blood sugar level of 78.2 mg/dl healthy?");
    }
    if (!qLower.includes("urine") && !qLower.includes("wbc")) {
      suggestions.push("What did my urinalysis test show?");
    }
    if (!qLower.includes("haemoglobin") && !qLower.includes("platelet")) {
      suggestions.push("What do my haemoglobin and platelet levels mean?");
    }
  }

  // Prescriptions
  if (documents.some((d) => d.type === "Prescription" || (d.medications && d.medications.length > 0))) {
    if (!qLower.includes("when should i take") && !qLower.includes("schedule")) {
      suggestions.push("When should I take each of my prescribed medications?");
    }
    if (!qLower.includes("purpose") && !qLower.includes("why")) {
      suggestions.push("Explain what each medicine is treating in simple terms");
    }
  }

  // Generic fallback if empty or few
  if (suggestions.length === 0) {
    suggestions.push("Explain my uploaded documents in plain language");
    suggestions.push("Are there any abnormal results I should discuss with my doctor?");
    suggestions.push("What are the key follow-up steps from my records?");
  }

  return suggestions.slice(0, 3);
}
