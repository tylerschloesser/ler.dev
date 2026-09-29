export type Distance = 'marathon' | 'half-marathon'

export type Split = { label: string; time: string }

export type Outcome =
  | {
      status: 'finished'
      /** Official chip time. */
      time: string
      gunTime?: string
      bib?: string
      /** Overall place. */
      rank?: number
      participants?: number
      genderRank?: number
      genderParticipants?: number
      division?: string
      divisionRank?: number
      divisionParticipants?: number
      /** Official timing-mat splits (cumulative chip time). */
      splits?: Split[]
    }
  | { status: 'dnf'; reason: 'injury' | 'cancelled' }

export type Link = { label: string; url: string }

export type Location = { city: string; region: string; country?: string; lat: number; lng: number }

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
  'salt-lake-city': { city: 'Salt Lake City', region: 'UT', lat: 40.76, lng: -111.89 },
  'port-angeles': { city: 'Port Angeles', region: 'WA', lat: 48.12, lng: -123.43 },
  arlington: { city: 'Arlington', region: 'VA', lat: 38.88, lng: -77.07 },
  'chiang-mai': { city: 'Chiang Mai', region: 'Chiang Mai', country: 'Thailand', lat: 18.79, lng: 98.99 },
  fargo: { city: 'Fargo', region: 'ND', lat: 46.88, lng: -96.79 },
} satisfies Record<string, Location>

export type LocationId = keyof typeof LOCATIONS

export type Race = {
  id: string
  name: string
  date: string
  distance: Distance
  outcome: Outcome
  locationId: LocationId
  website?: string
  links?: Link[]
  /** Watch recording; the data lives in `activities/<id>.json`. */
  activity?: { source: 'garmin' | 'apple'; id: string; partial?: true }
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
  {
    id: '2024-12-01-seattle',
    name: 'Seattle',
    date: '2024-12-01',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '2:58:28',
      gunTime: '2:58:35',
      bib: '2229',
      rank: 54,
      participants: 1999,
      genderRank: 54,
      genderParticipants: 1389,
      division: 'M30-34',
      divisionRank: 11,
      divisionParticipants: 256,
      splits: [
        { label: '5K', time: '0:22:18' },
        { label: '10K', time: '0:43:05' },
        { label: '15K', time: '1:04:21' },
        { label: '20K', time: '1:25:09' },
        { label: 'Half', time: '1:29:50' },
        { label: '25K', time: '1:46:18' },
        { label: '30K', time: '2:07:02' },
        { label: '35K', time: '2:27:55' },
        { label: '40K', time: '2:49:30' },
      ],
    },
    locationId: 'seattle',
    website: 'https://www.seattlemarathon.org',
    links: [
      {
        label: 'Results',
        url: 'https://results.raceroster.com/v3/events/5bjn59ncvpdzwy97/race/220438/participant/ag2q295kkqscwqvq',
      },
    ],
    activity: { source: 'garmin', id: '17666283983', partial: true },
  },
  {
    id: '2025-02-08-mesa',
    name: 'Mesa',
    date: '2025-02-08',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '3:11:49',
      gunTime: '3:12:53',
      bib: '13667',
      rank: 369,
      participants: 3624,
      genderRank: 327,
      genderParticipants: 2286,
      division: 'M30-34',
      divisionRank: 74,
      divisionParticipants: 360,
      splits: [
        { label: '5K', time: '0:23:47' },
        { label: '10K', time: '0:46:04' },
        { label: '15K', time: '1:08:31' },
        { label: '20K', time: '1:30:38' },
        { label: 'Half', time: '1:35:14' },
        { label: '25K', time: '1:52:05' },
        { label: '30K', time: '2:14:35' },
        { label: '35K', time: '2:37:37' },
        { label: '40K', time: '3:01:44' },
      ],
    },
    locationId: 'mesa',
    website: 'https://mesamarathon.com',
    links: [
      { label: 'Results', url: 'https://mesamarathon.com/results?pk=8031429' },
      {
        label: 'Archived',
        url: 'https://web.archive.org/web/20260929162341/https://mesamarathon.com/results?pk=8031429',
      },
    ],
    activity: { source: 'garmin', id: '18224164606' },
  },
  {
    id: '2025-04-21-boston',
    name: 'Boston',
    date: '2025-04-21',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '3:06:26',
      bib: '4008',
      rank: 6105,
      participants: 28_407,
      genderRank: 5390,
      genderParticipants: 16_106,
      division: 'M18-39',
      divisionRank: 3334,
      divisionParticipants: 5642,
    },
    locationId: 'boston',
    website: 'https://www.baa.org/races/boston-marathon',
    links: [
      { label: 'Results', url: 'https://www.athlinks.com/event/20238/results/Event/1110118/Course/2599724/Bib/4008' },
    ],
    activity: { source: 'garmin', id: '18894486037' },
  },
  {
    id: '2025-04-26-salt-lake-city',
    name: 'Salt Lake City',
    date: '2025-04-26',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '3:06:19',
      gunTime: '3:06:38',
      bib: '233',
      rank: 32,
      participants: 1699,
      genderRank: 28,
      genderParticipants: 1142,
      division: 'M30-34',
      divisionRank: 3,
      divisionParticipants: 174,
      splits: [
        { label: '5 mi', time: '0:34:05' },
        { label: '9.6 mi', time: '1:28:51' },
        { label: '16.8 mi', time: '1:54:39' },
      ],
    },
    locationId: 'salt-lake-city',
    website: 'https://www.saltlakecitymarathon.com/',
    links: [{ label: 'Results', url: 'https://sites.chronotrack.com/event/79806/results/entry/72996917' }],
    activity: { source: 'garmin', id: '18942541414' },
  },
  {
    id: '2025-06-08-north-olympic-discovery',
    name: 'North Olympic Discovery',
    date: '2025-06-08',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '3:18:07',
      gunTime: '3:18:12',
      bib: '220',
      rank: 8,
      participants: 282,
      genderRank: 5,
      genderParticipants: 154,
      division: 'M30-34',
      divisionRank: 2,
      divisionParticipants: 24,
      splits: [{ label: 'Half', time: '1:28:14' }],
    },
    locationId: 'port-angeles',
    website: 'https://www.nodm.com/',
    links: [
      {
        label: 'Results',
        url: 'https://runsignup.com/Race/Results/80382/IndividualResult/cPJs?resultSetId=557153#U56089818',
      },
    ],
    activity: { source: 'garmin', id: '19400741204' },
  },
  {
    id: '2025-10-26-marine-corps',
    name: 'Marine Corps',
    date: '2025-10-26',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '4:32:32',
      gunTime: '4:41:58',
      bib: '7678',
      rank: 12_819,
      participants: 30_085,
      genderRank: 8558,
      genderParticipants: 17_758,
      division: 'M30-34',
      divisionRank: 1416,
      divisionParticipants: 2616,
      splits: [
        { label: '5K', time: '0:21:56' },
        { label: '10K', time: '0:41:54' },
        { label: 'Rock Creek', time: '0:50:02' },
        { label: '15K', time: '1:01:24' },
        { label: 'Half', time: '1:25:43' },
        { label: '25K', time: '1:41:19' },
        { label: '30K', time: '2:01:53' },
        { label: '35K', time: '2:30:44' },
        { label: '40K', time: '4:14:56' },
      ],
    },
    locationId: 'arlington',
    website: 'https://www.marinemarathon.com/',
    links: [{ label: 'Results', url: 'https://track.rtrt.me/e/MCM-2025#/dash/RVBF7KCX' }],
    activity: { source: 'garmin', id: '20804532372' },
  },
  {
    id: '2025-12-21-chiang-mai',
    name: 'Chiang Mai',
    date: '2025-12-21',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '4:25:55',
      gunTime: '4:26:48',
      bib: '1113',
      rank: 364,
      participants: 809,
      genderRank: 303,
      genderParticipants: 633,
      division: 'M18-39',
      divisionRank: 96,
      divisionParticipants: 188,
      splits: [
        { label: '8K', time: '0:50:57' },
        { label: '18.4K', time: '1:57:22' },
        { label: '23K', time: '2:24:44' },
        { label: '39K', time: '4:05:26' },
      ],
    },
    locationId: 'chiang-mai',
    website: 'https://www.chiangmaimarathon.com/',
    links: [{ label: 'Results', url: 'https://my.raceresult.com/374698/results' }],
    activity: { source: 'garmin', id: '21310384175' },
  },
  {
    id: '2026-05-30-fargo',
    name: 'Fargo',
    date: '2026-05-30',
    distance: 'marathon',
    outcome: {
      status: 'finished',
      time: '3:56:24',
      bib: '2746',
      rank: 337,
      participants: 1315,
      genderRank: 261,
      genderParticipants: 837,
      division: 'M30-34',
      divisionRank: 44,
      divisionParticipants: 115,
      splits: [
        { label: '5K', time: '0:21:46' },
        { label: '10K', time: '0:43:11' },
        { label: '6.8 mi', time: '0:47:16' },
        { label: '8 mi', time: '0:55:32' },
        { label: '10.6 mi', time: '1:12:01' },
        { label: '11 mi', time: '1:16:32' },
        { label: 'Half', time: '1:32:00' },
        { label: '15.1 mi', time: '1:47:40' },
        { label: '16 mi', time: '1:54:02' },
        { label: '18 mi', time: '2:12:19' },
        { label: '20 mi', time: '2:32:34' },
        { label: '22.6 mi', time: '3:02:31' },
        { label: '24.8 mi', time: '3:35:13' },
        { label: '25.2 mi', time: '3:41:32' },
      ],
    },
    locationId: 'fargo',
    website: 'https://fargomarathon.com/',
    links: [
      {
        label: 'Results',
        url: 'https://gallery.us.runnertag.site/events/2026-essentia-health-fargo-marathon/search/participants/2746',
      },
    ],
    activity: { source: 'garmin', id: '23069844309' },
  },
]
