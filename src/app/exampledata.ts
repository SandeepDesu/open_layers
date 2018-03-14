
export const exampleTableOne = {
  headers: [
    { title: 'sno', fieldName: 'id' }, { title: 'name', fieldName: 'fullname' }, { title: 'address', fieldName: 'address' }
  ],
  data: [
    { id: '1', fullname: 'kumar', address: 'monsanto' },
    { id: '2', fullname: 'kumar', address: 'monsanto' },
    { id: '3', fullname: 'kumar', address: 'monsanto' },
    { id: '4', fullname: 'kumar', address: 'monsanto' },
  ]
}

export const exampleTableTwo = {
  data: [{
    features: [
      {
        id: "world_l1_simplified.fid-4303a338_16221209f71_-296d",
        properties: {
          continent: "NA",
          hub: "North America",
          hub_abbr: "NA",
          l0_abbr: "USA",
          l0_iso_code: "US",
          l0_iso_num: "840",
          l0_long_name: "United States of America",
          l0_name: "United States of America",
          l1_admincode: "20",
          l1_iso_code: "KS",
          l1_name: "Kansas",
          world_area: "US"
        },
        type: "Feature"
      }
    ],
    geoid: "US",
    geoname: "United States of America",
    params: {
      geo: "ALL",
      kpi: "NPS",
      subgeo: "COUNTRY"
    }
  }], headers: [{ 'title': 'ID', 'fieldName': 'features[0].id' }, { 'title': 'GEO', 'fieldName': 'geoid' }, { 'title': 'HUB', 'fieldName': 'features[0].properties.hub' }]
};


export const multiBarData = [
  {
    allvalues: [
      {
        count: 5,
        value: 100,
        year: "2016"
      },
      {
        count: 9,
        value: 55.55555555555556,
        year: "2017"
      }
    ],
    color: "#006837",
    geoid: "WA",
    value: 100
  }
]