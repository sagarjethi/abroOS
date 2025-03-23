use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::{to_value, from_value};
use sha2::{Sha256, Digest};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

#[wasm_bindgen]
pub struct ZKProver {
    // Add any state needed for the prover
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeystrokePattern {
    pub keystroke_deltas: Vec<f64>,
    pub total_time: f64,
    pub key_count: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ZKProof {
    pub pattern_hash: String,
    pub timestamp: u64,
    pub signature: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PublicValues {
    pub content_hash: String,
    pub authority_hash: String,
    pub human_verified: bool,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VerificationData {
    pub word_count: u32,
    pub average_keystroke_time: f64,
    pub total_editing_time: f64,
}

#[wasm_bindgen]
impl ZKProver {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        ZKProver {}
    }

    pub fn collect_keystroke_patterns(&self, keystroke_deltas_js: JsValue) -> Result<JsValue, JsValue> {
        let keystroke_deltas: Vec<f64> = from_value(keystroke_deltas_js)?;
        
        let pattern = KeystrokePattern {
            keystroke_deltas: keystroke_deltas.clone(),
            total_time: keystroke_deltas.iter().sum(),
            key_count: keystroke_deltas.len() as u32,
        };

        to_value(&pattern).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn generate_proof(&self, keystroke_pattern_js: JsValue) -> Result<JsValue, JsValue> {
        let keystroke_pattern: KeystrokePattern = from_value(keystroke_pattern_js)?;
        
        // Generate a hash of the pattern
        let mut hasher = Sha256::new();
        hasher.update(format!("{:?}", keystroke_pattern).as_bytes());
        let pattern_hash = format!("{:x}", hasher.finalize());

        let zk_proof = ZKProof {
            pattern_hash,
            timestamp: js_sys::Date::now() as u64,
            signature: "dummy_signature".to_string(), // Replace with actual signature
        };

        to_value(&zk_proof).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn verify_proof(&self, zk_proof_js: JsValue) -> Result<JsValue, JsValue> {
        let _zk_proof: ZKProof = from_value(zk_proof_js)?;
        
        // Verify the proof (simplified for now)
        let result = true; // Replace with actual verification logic

        to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn generate_human_typing_proof(&self, content: &str, keystroke_pattern_js: JsValue) -> Result<JsValue, JsValue> {
        let keystroke_pattern: KeystrokePattern = from_value(keystroke_pattern_js)?;
        
        // Generate content hash
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        let content_hash = format!("{:x}", hasher.finalize());
        
        let proof_components = json!([
            content_hash,
            keystroke_pattern.keystroke_deltas.iter().sum::<f64>(),
            keystroke_pattern.keystroke_deltas.len() as f64,
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()
        ]);
        
        let proof_str = serde_json::to_string(&proof_components)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        let mut hasher = Sha256::new();
        hasher.update(proof_str.as_bytes());
        let pattern_hash = format!("{:x}", hasher.finalize());

        let zk_proof = ZKProof {
            pattern_hash,
            timestamp: js_sys::Date::now() as u64,
            signature: "dummy_signature".to_string(), // Replace with actual signature
        };
        
        to_value(&zk_proof).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn verify_proof_on_chain(&self, zk_proof_js: JsValue) -> Result<JsValue, JsValue> {
        let zk_proof: ZKProof = from_value(zk_proof_js)?;
        
        // In a real implementation, this would submit the proof to a smart contract
        // Here we're just simulating the verification
        
        let result = json!({
            "verified": zk_proof.signature == "dummy_signature",
            "timestamp": zk_proof.timestamp
        });
        
        to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

fn console_log(s: &str) {
    log(s);
} 