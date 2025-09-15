// Burkina Faso regions (former names as primary labels) with towns
// Structure: { code, region: formerName, current: endogenousName, capital, towns: [] }
// Provided by user; towns include capital + major towns/provinces listed.

export const BF_LOCATIONS = [
  {
    code: 'boucle',
    region: 'Boucle du Mouhoun',
    current: 'Bankui',
    capital: 'Dédougou',
    towns: ['Dédougou','Nouna','Solenzo']
  },
  {
    code: 'sud_ouest',
    region: 'Sud-Ouest',
    current: 'Djôrô',
    capital: 'Gaoua',
    towns: ['Gaoua','Diébougou','Batié']
  },
  {
    code: 'est_fada',
    region: 'Est (Gourma/Kompienga)',
    current: 'Goulmou',
    capital: "Fada N'gourma",
    towns: ["Fada N'gourma",'Pama']
  },
  {
    code: 'hauts_bassins',
    region: 'Hauts-Bassins',
    current: 'Guiriko',
    capital: 'Bobo-Dioulasso',
    towns: ['Bobo-Dioulasso','Houndé','Orodara']
  },
  {
    code: 'centre',
    region: 'Centre',
    current: 'Kadiogo',
    capital: 'Ouagadougou',
    towns: ['Ouagadougou','Komsilga','Tanghin-Dassouri']
  },
  {
    code: 'centre_nord',
    region: 'Centre-Nord',
    current: 'Kuilsé',
    capital: 'Kaya',
    towns: ['Kaya','Kongoussi','Boussouma']
  },
  {
    code: 'sahel_liptako',
    region: 'Sahel (Oudalan/Séno/Yagha)',
    current: 'Liptako',
    capital: 'Dori',
    towns: ['Dori','Gorom-Gorom','Sebba']
  },
  {
    code: 'centre_est',
    region: 'Centre-Est',
    current: 'Nakambé',
    capital: 'Tenkodogo',
    towns: ['Tenkodogo','Koupéla','Garango']
  },
  {
    code: 'centre_ouest',
    region: 'Centre-Ouest',
    current: 'Nando',
    capital: 'Koudougou',
    towns: ['Koudougou','Réo','Nandiala']
  },
  {
    code: 'centre_sud',
    region: 'Centre-Sud',
    current: 'Nazinon',
    capital: 'Manga',
    towns: ['Manga','Kombissiri','Gogo']
  },
  {
    code: 'plateau_central',
    region: 'Plateau-Central',
    current: 'Oubri',
    capital: 'Ziniaré',
    towns: ['Ziniaré','Boussé','Zitenga']
  },
  {
    code: 'est_sirba',
    region: 'Est (Gnagna/Komondjari)',
    current: 'Sirba',
    capital: 'Bogandé',
    towns: ['Bogandé','Manni','Bartiébougou']
  },
  {
    code: 'sahel_soum',
    region: 'Sahel (Soum/Karo-Peli)',
    current: 'Soum',
    capital: 'Djibo',
    towns: ['Djibo','Arbinda','Kelbo']
  },
  {
    code: 'sourou_block',
    region: 'Boucle du Mouhoun (Kossi/Nayala/Sourou)',
    current: 'Sourou',
    capital: 'Tougan',
    towns: ['Tougan','Lanfiéra','Di']
  },
  {
    code: 'cascades',
    region: 'Cascades',
    current: 'Tannounyan',
    capital: 'Banfora',
    towns: ['Banfora','Sindou','Niangoloko']
  },
  {
    code: 'est_tapoa',
    region: 'Est (Tapoa/Dyamongou)',
    current: 'Tapoa',
    capital: 'Diapaga',
    towns: ['Diapaga','Kantchari','Partiaga']
  },
  {
    code: 'nord',
    region: 'Nord',
    current: 'Yaadga',
    capital: 'Ouahigouya',
    towns: ['Ouahigouya','Titao','Yako']
  }
];

export const flattenTowns = () => BF_LOCATIONS.flatMap(r => r.towns.map(t => ({ region: r.region, town: t, code: r.code })));
