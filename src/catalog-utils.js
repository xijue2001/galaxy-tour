export const normalizeSearch=value=>String(value).normalize('NFKC').toLowerCase().replace(/[\s\-·／/’'*]/g,'');
export function filterDestinations(destinations,query='',category='all'){
 const needle=normalizeSearch(query);
 return destinations.filter(d=>(category==='all'||d.category===category||(category==='nebula'&&d.category==='planetary'))&&(!needle||normalizeSearch([d.id,...Object.values(d.names),...(d.aliases||[])].join(' ')).includes(needle)));
}
