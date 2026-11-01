/** Portraits follow the actual campaign form, also in isolated battle previews. */
export const BENEFACTOR_PORTRAITS=['benefactor/benefactor-portrait','portrait-benefactor-sun','portrait-benefactor-heart']as const;
export const benefactorPortraitPath=(form:number)=>`art/vector/${BENEFACTOR_PORTRAITS[form]??BENEFACTOR_PORTRAITS[0]}.svg`;
