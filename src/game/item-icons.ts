import { artPath } from '../content/art-assets';
import type { UIIcon } from '../content/ui-art';
/** Decorative: the adjacent name/count remains the accessible label. */
export const icon=(id:UIIcon)=>`<img class="item-icon" data-icon="${id}" src="${import.meta.env.BASE_URL}${artPath(`ui/${id}`)}" width="32" height="32" alt="" aria-hidden="true"/>`;
