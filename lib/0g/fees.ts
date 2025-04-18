import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk';
import { Contract, formatEther } from 'ethers';
import { getNetworkConfig } from './network';

export interface FeeInfo {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawGasFee: bigint;
  rawTotalFee: bigint;
  isLoading?: boolean;
}

/**
 * Gets a flow contract instance
 * @param flowAddress The flow contract address
 * @param signer The signer
 * @returns The flow contract
 */
export function getFlowContract(flowAddress: string, signer: any): Contract {
  return FixedPriceFlow__factory.connect(flowAddress, signer) as unknown as Contract;
}

/**
 * Calculates fees for a submission
 * @param submission The submission object
 * @param flowContract The flow contract
 * @param provider Any provider connected to the 0G network
 * @returns A promise that resolves to the fee information and any error
 */
export async function calculateFees(
  submission: any, 
  flowContract: Contract, 
  provider: any
): Promise<[FeeInfo | null, Error | null]> {
  try {
    // Get market address and contract
    const marketAddr = await flowContract.market();
    const market = getMarketContract(marketAddr, provider);
    
    // Get price per sector
    const pricePerSector = await market.pricePerSector();
    
    // Calculate storage fee
    const storageFee = calculatePrice(submission, pricePerSector);
    
    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Estimate gas
    let gasEstimate;
    try {
      gasEstimate = await flowContract.submit.estimateGas(submission, { value: storageFee });
    } catch (error) {
      // Use fallback gas estimate
      gasEstimate = BigInt(500000); // Fallback gas estimate
    }
    
    // Calculate estimated gas fee and total fee
    const estimatedGasFee = gasEstimate * gasPrice;
    const totalFee = BigInt(storageFee) + estimatedGasFee;
    
    return [{
      storageFee: formatEther(storageFee),
      estimatedGas: formatEther(estimatedGasFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: storageFee,
      rawGasFee: estimatedGasFee,
      rawTotalFee: totalFee,
      isLoading: false
    }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
} 