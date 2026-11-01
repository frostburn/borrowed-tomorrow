// Four delay lines in a settled stereo room; eight during a crossfade.
export const ROOM_DELAYS=[.0297,.0437]as const;

/** Unity-DC one-pole loss: L(z) = (1-p)/(1-p z^-1).
 * A high cutoff gently damps repeated reflections without a dark return EQ. */
export function reflectionCoefficients(sampleRate:number,cutoff:number){
 const pole=Math.exp(-2*Math.PI*cutoff/sampleRate);
 return {feedforward:[1-pole],feedback:[1,-pole]};
}
