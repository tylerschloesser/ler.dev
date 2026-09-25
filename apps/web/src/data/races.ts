export type Distance = 'marathon' | 'half-marathon'

export type Outcome =
  | { status: 'finished'; time: string; rank?: number; participants?: number }
  | { status: 'dnf'; reason: 'injury' | 'cancelled' }

export type Link = { label: string; url: string }

export type Location = { city: string; region: string; lat: number; lng: number }

export const LOCATIONS = {
  minneapolis: { city: 'Minneapolis', region: 'MN', lat: 44.97, lng: -93.26 },
  seattle: { city: 'Seattle', region: 'WA', lat: 47.61, lng: -122.33 },
  snoqualmie: { city: 'Snoqualmie Pass', region: 'WA', lat: 47.42, lng: -121.41 },
  'sauvie-island': { city: 'Sauvie Island', region: 'OR', lat: 45.66, lng: -122.82 },
  nashville: { city: 'Nashville', region: 'TN', lat: 36.16, lng: -86.78 },
  'las-vegas': { city: 'Las Vegas', region: 'NV', lat: 36.17, lng: -115.14 },
  'red-rock': { city: 'Red Rock Canyon', region: 'NV', lat: 36.14, lng: -115.43 },
  savannah: { city: 'Savannah', region: 'GA', lat: 32.08, lng: -81.09 },
  mesa: { city: 'Mesa', region: 'AZ', lat: 33.42, lng: -111.83 },
  chicago: { city: 'Chicago', region: 'IL', lat: 41.88, lng: -87.63 },
  carlsbad: { city: 'Carlsbad', region: 'CA', lat: 33.16, lng: -117.35 },
  boston: { city: 'Boston', region: 'MA', lat: 42.35, lng: -71.08 },
  austin: { city: 'Austin', region: 'TX', lat: 30.27, lng: -97.74 },
} satisfies Record<string, Location>

export type LocationId = keyof typeof LOCATIONS

export type Race = {
  id: string
  name: string
  date: string
  distance: Distance
  outcome: Outcome
  locationId: LocationId
  links?: Link[]
}

// Oldest first.
export const RACES: Race[] = [
  {
    id: '2015-05-31-minneapolis',
    name: 'Minneapolis',
    date: '2015-05-31',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:32:37', rank: 134, participants: 903 },
    locationId: 'minneapolis',
  },
  {
    id: '2016-06-18-rnr-seattle',
    name: "Rock 'n' Roll Seattle",
    date: '2016-06-18',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:39:56', rank: 279, participants: 2571 },
    locationId: 'seattle',
    links: [{ label: 'Photos', url: 'https://www.marathonfoto.com/Proofs?PIN=L2X659&lastName=Schloesser' }],
  },
  {
    id: '2017-04-29-rnr-nashville',
    name: "Rock 'n' Roll Nashville",
    date: '2017-04-29',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:54:32', rank: 196, participants: 2383 },
    locationId: 'nashville',
  },
  {
    id: '2019-06-08-rnr-seattle-half',
    name: "Rock 'n' Roll Seattle",
    date: '2019-06-08',
    distance: 'half-marathon',
    outcome: { status: 'finished', time: '1:29:54', rank: 82, participants: 9968 },
    locationId: 'seattle',
  },
  {
    id: '2019-11-17-rnr-las-vegas',
    name: "Rock 'n' Roll Las Vegas",
    date: '2019-11-17',
    distance: 'marathon',
    outcome: { status: 'dnf', reason: 'injury' },
    locationId: 'las-vegas',
  },
  {
    id: '2021-11-06-rnr-savannah',
    name: "Rock 'n' Roll Savannah",
    date: '2021-11-06',
    distance: 'marathon',
    outcome: { status: 'dnf', reason: 'cancelled' },
    locationId: 'savannah',
  },
  {
    id: '2022-01-22-red-rock-canyon',
    name: 'Red Rock Canyon',
    date: '2022-01-22',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:28:55', rank: 3, participants: 73 },
    locationId: 'red-rock',
  },
  {
    id: '2022-02-12-mesa',
    name: 'Mesa',
    date: '2022-02-12',
    distance: 'marathon',
    outcome: { status: 'finished', time: '2:54:46', rank: 62, participants: 2312 },
    locationId: 'mesa',
  },
  {
    id: '2022-07-22-foot-traffic-flat',
    name: 'Foot Traffic Flat',
    date: '2022-07-22',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:04:57', rank: 18, participants: 205 },
    locationId: 'sauvie-island',
  },
  {
    id: '2022-10-09-chicago',
    name: 'Chicago',
    date: '2022-10-09',
    distance: 'marathon',
    outcome: { status: 'finished', time: '4:42:25', rank: 24_410, participants: 39_420 },
    locationId: 'chicago',
  },
  {
    id: '2022-11-26-seattle',
    name: 'Seattle',
    date: '2022-11-26',
    distance: 'marathon',
    outcome: { status: 'dnf', reason: 'injury' },
    locationId: 'seattle',
  },
  {
    id: '2023-01-15-carlsbad',
    name: 'Carlsbad',
    date: '2023-01-15',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:16:38', rank: 51, participants: 1053 },
    locationId: 'carlsbad',
  },
  {
    id: '2023-04-17-boston',
    name: 'Boston',
    date: '2023-04-17',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:29:55', rank: 12_233, participants: 30_000 },
    locationId: 'boston',
    links: [
      {
        label: 'Results',
        url: 'https://results.baa.org/2023/?content=detail&fpid=search&pid=search&idp=9TGHS6FF17D625&lang=EN_CAP&event=R&event_main_group=runner&pidp=start&search%5Bname%5D=Schloesser&search_event=R',
      },
      { label: 'Archived', url: 'https://archive.is/puoHU' },
    ],
  },
  {
    id: '2023-07-30-jack-and-jill',
    name: 'Jack & Jill',
    date: '2023-07-30',
    distance: 'marathon',
    outcome: { status: 'finished', time: '2:43:35', rank: 5, participants: 515 },
    locationId: 'snoqualmie',
    links: [
      {
        label: 'Results',
        url: 'https://www.athlinks.com/event/379803/results/Event/1055186/Course/2380734/Bib/4003',
      },
    ],
  },
  {
    id: '2023-10-01-twin-cities',
    name: 'Twin Cities',
    date: '2023-10-01',
    distance: 'marathon',
    outcome: { status: 'dnf', reason: 'cancelled' },
    locationId: 'minneapolis',
  },
  {
    id: '2023-10-08-chicago',
    name: 'Chicago',
    date: '2023-10-08',
    distance: 'marathon',
    outcome: { status: 'finished', time: '3:36:07', rank: 12_376, participants: 48_292 },
    locationId: 'chicago',
    links: [
      {
        label: 'Results',
        url: 'https://results.chicagomarathon.com/2023/?content=detail&fpid=search&pid=search&idp=9TGG963827C9EC&lang=EN_CAP&event=MAR&search%5Bname%5D=Schloesser&search_event=MAR',
      },
      { label: 'Archived', url: 'https://archive.is/OJ3bt' },
    ],
  },
  {
    id: '2023-11-25-seattle',
    name: 'Seattle',
    date: '2023-11-25',
    distance: 'marathon',
    outcome: { status: 'finished', time: '2:59:10', rank: 52, participants: 1723 },
    locationId: 'seattle',
    links: [
      {
        label: 'Results',
        url: 'https://results.raceroster.com/v2/en-US/results/9k4gs2zpyympmtxs/detail/3tandg5sbpnewt5h',
      },
      { label: 'Archived', url: 'https://archive.is/wzA7H' },
    ],
  },
  {
    id: '2024-02-18-austin',
    name: 'Austin',
    date: '2024-02-18',
    distance: 'marathon',
    outcome: { status: 'finished', time: '2:54:43', rank: 26, participants: 4002 },
    locationId: 'austin',
    links: [
      { label: 'Results', url: 'https://www.mychiptime.com/searchevent.php?id=15555' },
      { label: 'Archived', url: 'https://archive.ph/omMPM' },
    ],
  },
]
