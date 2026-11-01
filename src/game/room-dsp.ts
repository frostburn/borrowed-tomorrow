export const ROOM_DELAYS=[.0137,.0199,.0311,.0437,.0613,.0899]as const;

/** Blend a bounded amount of two-pole absorption with a unity branch.
 * DC stays unity. Amount zero recovers the lossless all-pass diffuser.
 * Amount one preserves the original fully absorbed branch for other rooms. */
export function reflectionCoefficients(sampleRate:number,cutoff:number,amount:number){
 const pole=Math.exp(-2*Math.PI*cutoff/sampleRate),feedback=[1,-2*pole,pole*pole];
 const feedforward=amount===1?[(1-pole)**2]:[(1-amount)+amount*(1-pole)**2,-2*pole*(1-amount),pole*pole*(1-amount)];
 return {feedforward,feedback};
}
