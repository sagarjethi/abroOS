# Testing the TEE Framework with Actual Hardware

This guide explains how to integrate and test the abroOs TEE framework with actual hardware-backed Trusted Execution Environments.

## Supported TEE Technologies

The framework has adapters for the following hardware TEE technologies:

1. **Intel SGX (Software Guard Extensions)**
2. **ARM TrustZone**
3. **AMD SEV (Secure Encrypted Virtualization)** - Not yet implemented

## Prerequisites

### For Intel SGX

- Intel CPU with SGX support (6th gen or newer)
- SGX-enabled BIOS settings
- SGX Platform Software (PSW) installed
- Intel SGX SDK (for development)
- For remote attestation: Intel Attestation Service (IAS) credentials

### For ARM TrustZone

- ARM device with TrustZone support
- TrustZone-enabled Trusted Applications
- Proper key provisioning for trusted applications

## Installation Steps

### Intel SGX Setup

1. **Check SGX Support**:
   ```bash
   # Linux
   apt-get install cpuid
   cpuid | grep SGX
   
   # Windows
   Download and run Intel SGX Detection Tool
   ```

2. **Install SGX Driver and SDK**:
   ```bash
   # For Ubuntu
   wget https://download.01.org/intel-sgx/sgx-linux/2.15/distro/ubuntu20.04-server/sgx_linux_x64_driver_2.11.0_2d2b795.bin
   chmod +x sgx_linux_x64_driver_2.11.0_2d2b795.bin
   sudo ./sgx_linux_x64_driver_2.11.0_2d2b795.bin
   
   # SDK installation
   wget https://download.01.org/intel-sgx/sgx-linux/2.15/distro/ubuntu20.04-server/sgx_linux_x64_sdk_2.15.100.3.bin
   chmod +x sgx_linux_x64_sdk_2.15.100.3.bin
   sudo ./sgx_linux_x64_sdk_2.15.100.3.bin
   ```

3. **Install SGX-enabled browser extension** (for web applications)

### ARM TrustZone Setup

1. **Ensure device has TrustZone support**
   - Most modern ARM devices (Cortex-A series) support TrustZone

2. **Setup Trusted Execution Environment OS (OP-TEE)**:
   ```bash
   git clone https://github.com/OP-TEE/build.git
   cd build
   make toolchains
   make
   ```

3. **Configure device for TrustZone**:
   - Enable secure boot
   - Provision device keys

## Integrating with abroOs

### Testing with Intel SGX

1. **Build SGX bridge library**:
   ```bash
   # From the project root
   cd native-modules/sgx-bridge
   make
   ```

2. **Copy the SGX bridge WebAssembly module**:
   ```bash
   cp native-modules/sgx-bridge/dist/sgx-bridge.wasm public/wasm/
   ```

3. **Initialize in your app**:
   ```typescript
   import { HardwareTeeManager } from '@/lib/tee/hardware-integration';
   
   // Initialize hardware TEE support
   const hardwareTeeManager = HardwareTeeManager.getInstance();
   await hardwareTeeManager.initializeWithHardware();
   
   // Check if hardware TEE is available
   const isUsingHardware = hardwareTeeManager.isUsingHardwareTee();
   console.log('Using hardware TEE:', isUsingHardware);
   ```

### Testing with ARM TrustZone

1. **Deploy Trusted Application to device**:
   ```bash
   # From the project root
   cd native-modules/trustzone-app
   make
   make install
   ```

2. **Configure TrustZone connection in app**:
   ```typescript
   // Add ARM TrustZone adapter in hardware-integration.ts
   const trustZoneAdapter = new ArmTrustZoneAdapter();
   await trustZoneAdapter.initialize();
   ```

## Verifying Hardware TEE Integration

The system includes a `HardwareTeeTest` component that can help verify that hardware integration is working:

1. **Add the component to a page**:
   ```tsx
   import { HardwareTeeTest } from '@/components/tee/HardwareTeeTest';
   
   // In your page component:
   return (
     <div>
       <HardwareTeeTest />
     </div>
   );
   ```

2. **Run integration tests**:
   ```bash
   npm run test:integration:tee
   ```

## Remote Attestation Testing

For SGX, you can test remote attestation using the Intel Attestation Service (IAS):

1. **Register with Intel Attestation Service**
   - Get API key from [Intel's portal](https://api.portal.trustedservices.intel.com/)

2. **Configure attestation service**:
   ```typescript
   // In your app initialization
   import { SgxAttestationService } from '@/lib/tee/attestation';
   
   const attestationService = new SgxAttestationService({
     apiKey: 'your-ias-api-key',
     spid: 'your-spid',
     serviceUrl: 'https://api.trustedservices.intel.com/sgx/attestation/v4'
   });
   
   // Perform attestation
   const attestationResult = await attestationService.performAttestation();
   ```

## Common Issues and Troubleshooting

1. **SGX Not Detected**
   - Ensure SGX is enabled in BIOS
   - Check if SGX driver is installed correctly
   - Verify CPU supports SGX

2. **TrustZone Not Working**
   - Verify device has TrustZone support
   - Check if secure boot is enabled
   - Ensure proper key provisioning

3. **Attestation Failures**
   - Verify network connectivity to attestation service
   - Check credentials and API keys
   - Ensure system time is synchronized

## Performance Considerations

When running with hardware TEE, consider the following performance implications:

1. **Enclave Entry/Exit Overhead**:
   - Switching between normal execution and TEE execution has overhead
   - Batch operations when possible

2. **Memory Limitations**:
   - SGX has enclave size limitations (typically 128MB)
   - Plan memory usage accordingly

3. **Attestation Latency**:
   - Remote attestation adds latency to initialization
   - Cache attestation results when appropriate

## Security Considerations

1. **Side-Channel Attacks**:
   - Hardware TEEs may still be vulnerable to side-channel attacks
   - Follow Intel/ARM security advisories

2. **Untrusted Inputs**:
   - Validate all inputs before processing in TEE
   - Don't assume hardware TEE makes arbitrary code secure

3. **Key Management**:
   - Properly manage secrets within the TEE
   - Use sealing for persistent secrets

## Further Resources

- [Intel SGX Developer Guide](https://download.01.org/intel-sgx/latest/linux-latest/docs/)
- [ARM TrustZone Documentation](https://developer.arm.com/documentation/100935/0100/)
- [Open Enclave SDK](https://openenclave.io/sdk/)
- [Microsoft Azure Confidential Computing](https://azure.microsoft.com/en-us/solutions/confidential-compute/) 