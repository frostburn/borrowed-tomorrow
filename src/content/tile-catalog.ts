type Property=Record<string,unknown>;
type PackedPage={tiles:{type?:string;properties?:number|Property[]}[]};

/** Restore interned tile properties, including the tile's repeated display name. */
export function expandTileCatalog<T extends PackedPage[]>(pages:T,profiles:(Property|null)[][]):T {
  for(const page of pages)for(const tile of page.tiles){
    if(typeof tile.properties!=='number')continue;
    tile.properties=profiles[tile.properties].map(p=>p===null?{name:'name',type:'string',value:tile.type}:{...p});
  }
  return pages;
}
