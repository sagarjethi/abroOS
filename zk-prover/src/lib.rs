use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};
use anyhow::{Result, anyhow};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KeystrokePattern {
    pub timings: Vec<f64>,
    pub distributions: Vec<f64>,
    pub edit_patterns: Vec<String>,
    pub velocity: f64,
    pub variance_score: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ZKProof {
    pub proof_data: String,
    pub public_values: PublicValues,
    pub verification_data: VerificationData,
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
pub struct ZKProver {}

#[wasm_bindgen]
impl ZKProver {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_log("ZKProver initialized");
        ZKProver {}
    }

    #[wasm_bindgen]
    pub fn collect_keystroke_patterns(&self, keystroke_deltas_js: &JsValue) -> Result<JsValue, JsValue> {
        let keystroke_deltas: Vec<f64> = keystroke_deltas_js.into_serde()
            .map_err(|e| JsValue::from_str(&format!("Failed to parse keystroke deltas: {}", e)))?;
        
        if keystroke_deltas.len() < 20 {
            return Err(JsValue::from_str("Not enough keystroke data to generate a valid pattern"));
        }
        
        // Calculate timing distributions
        let avg = keystroke_deltas.iter().sum::<f64>() / keystroke_deltas.len() as f64;
        let variance = keystroke_deltas.iter()
            .map(|d| (d - avg).powi(2))
            .sum::<f64>() / keystroke_deltas.len() as f64;
        
        // Create distribution buckets (simplified)
        let mut distributions = vec![0.0; 5]; // 5 buckets
        for delta in &keystroke_deltas {
            let bucket_index = (delta / 200.0).min(4.0).floor() as usize;
            distributions[bucket_index] += 1.0;
        }
        
        // Normalize distributions
        let normalized_distributions: Vec<f64> = distributions.iter()
            .map(|d| d / keystroke_deltas.len() as f64)
            .collect();
        
        // Simple edit pattern detection
        let edit_patterns = vec!["sequential-typing".to_string()];
        
        let pattern = KeystrokePattern {
            timings: keystroke_deltas,
            distributions: normalized_distributions,
            edit_patterns,
            velocity: 1000.0 / avg, // Characters per second
            variance_score: variance,
        };
        
        JsValue::from_serde(&pattern)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize pattern: {}", e)))
    }

    #[wasm_bindgen]
    pub fn generate_human_typing_proof(&self, content: &str, keystroke_pattern_js: &JsValue) -> Result<JsValue, JsValue> {
        let keystroke_pattern: KeystrokePattern = keystroke_pattern_js.into_serde()
            .map_err(|e| JsValue::from_str(&format!("Failed to parse keystroke pattern: {}", e)))?;
        
        console_log(&format!("Generating human typing proof..."));
        console_log(&format!("Content length: {}", content.len()));
        
        // Calculate content hash
        let content_hash = hash_content(content);
        
        // Determine if the typing patterns match human behavior
        let is_human = self.verify_human_patterns(&keystroke_pattern);
        
        // Generate simulated proof
        let proof_data = self.simulate_proof_generation(&content_hash, &keystroke_pattern)
            .map_err(|e| JsValue::from_str(&format!("Failed to generate proof: {}", e)))?;
        
        // Generate public values
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
            
        let authority_hash = hash_string(&format!("{}{}", timestamp, content_hash));
        
        let public_values = PublicValues {
            content_hash,
            authority_hash,
            human_verified: is_human,
            timestamp,
        };
        
        // Additional verification data
        let word_count = content.split_whitespace().count() as u32;
        let average_keystroke_time = keystroke_pattern.timings.iter().sum::<f64>() / keystroke_pattern.timings.len() as f64;
        let total_editing_time = keystroke_pattern.timings.iter().sum::<f64>();
        
        let verification_data = VerificationData {
            word_count,
            average_keystroke_time,
            total_editing_time,
        };
        
        let zk_proof = ZKProof {
            proof_data,
            public_values,
            verification_data,
        };
        
        JsValue::from_serde(&zk_proof)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize ZK proof: {}", e)))
    }

    #[wasm_bindgen]
    pub fn verify_proof_on_chain(&self, zk_proof_js: &JsValue) -> Result<JsValue, JsValue> {
        let zk_proof: ZKProof = zk_proof_js.into_serde()
            .map_err(|e| JsValue::from_str(&format!("Failed to parse ZK proof: {}", e)))?;
        
        // In a real implementation, this would submit the proof to a smart contract
        // Here we're just simulating the verification
        
        let tx_hash = format!("0x{}", hash_string(&zk_proof.proof_data)[..40].to_string());
        
        let result = serde_json::json!({
            "verified": zk_proof.public_values.human_verified,
            "txHash": tx_hash
        });
        
        JsValue::from_serde(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize verification result: {}", e)))
    }
    
    fn verify_human_patterns(&self, patterns: &KeystrokePattern) -> bool {
        // Humans typically have variance in typing speed
        if patterns.variance_score < 5000.0 || patterns.variance_score > 500000.0 {
            return false;
        }
        
        // Humans typically have a distribution of typing speeds
        if patterns.distributions.iter().any(|&d| d > 0.5) {
            return false;
        }
        
        // More sophisticated checks would be implemented in a real system
        true
    }
    
    fn simulate_proof_generation(&self, content_hash: &str, patterns: &KeystrokePattern) -> Result<String> {
        // In a real implementation, this would be an actual ZK proof generation
        // For this example, we'll create a simulated proof string
        
        let proof_components = serde_json::json!([
            content_hash,
            patterns.velocity,
            patterns.variance_score,
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()
        ]);
        
        let proof_str = serde_json::to_string(&proof_components)
            .map_err(|e| anyhow!("Failed to serialize proof components: {}", e))?;
            
        Ok(base64_encode(&proof_str))
    }
}

fn hash_content(content: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn hash_string(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn base64_encode(input: &str) -> String {
    use js_sys::JsString;
    let js_string = JsString::from(input);
    js_sys::global().unchecked_into::<js_sys::Object>()
        .get("btoa").unwrap()
        .unchecked_into::<js_sys::Function>()
        .call1(&js_sys::global(), &js_string)
        .unwrap()
        .as_string()
        .unwrap()
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

fn console_log(s: &str) {
    log(s);
} 