export enum RaceType {
  Marathon = 'marathon',
  MarathonDnf = 'marathon-dnf',
  HalfMarathon = 'half-marathon',
}

export interface MarathonRace {
  type: RaceType.Marathon
  name: string
  date: string
  time: string
  rank?: number
  participants?: number
  links?: string[]
  state: string
}

export enum DnfReason {
  Injury = 'injury',
  Cancelled = 'cancelled',
}

export interface MarathonDnfRace {
  type: RaceType.MarathonDnf
  name: string
  date: string
  state: string
  reason: DnfReason
}

export interface HalfMarathonRace {
  type: RaceType.HalfMarathon
  name: string
  date: string
  time: string
  rank?: number
  participants?: number
  links?: string[]
  state: string
}

export type Race =
  | MarathonRace
  | MarathonDnfRace
  | HalfMarathonRace

export const RACES: Race[] = [
  {
    type: RaceType.Marathon,
    name: 'Minneapolis',
    date: '2015-05-31',
    time: '3:32:37',
    rank: 134,
    participants: 903,
    state: 'MN',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Seattle",
    date: '2016-06-18',
    time: '3:39:56',
    links: [
      'https://www.marathonfoto.com/Proofs?PIN=L2X659&lastName=Schloesser',
    ],
    rank: 279,
    participants: 2571,
    state: 'WA',
  },
  {
    type: RaceType.Marathon,
    name: "Rock 'n' Roll Nashville",
    date: '2017-04-29',
    time: '3:54:32',
    rank: 196,
    participants: 2383,
    state: 'TN',
  },
  {
    type: RaceType.HalfMarathon,
    name: "Rock 'n' Roll Seattle",
    date: '2019-06-08',
    time: '1:29:54',
    rank: 82,
    participants: 9968,
    state: 'WA',
  },
  {
    type: RaceType.MarathonDnf,
    name: "Rock 'n' Roll Las Vegas",
    date: '2019-11-17',
    reason: DnfReason.Injury,
    state: 'NV',
  },
  {
    type: RaceType.MarathonDnf,
    name: "Rock 'n' Roll Savannah",
    date: '2021-11-06',
    reason: DnfReason.Cancelled,
    state: 'GA',
  },
  {
    type: RaceType.Marathon,
    name: 'Red Rock Canyon',
    date: '2022-01-22',
    time: '3:28:55',
    rank: 3,
    participants: 73,
    state: 'NV',
  },
  {
    type: RaceType.Marathon,
    name: 'Mesa',
    date: '2022-02-12',
    time: '2:54:46',
    rank: 62,
    participants: 2312,
    state: 'AZ',
  },
  {
    type: RaceType.Marathon,
    name: 'Foot Traffic Flat',
    date: '2022-07-22',
    time: '3:04:57',
    rank: 18,
    participants: 205,
    state: 'OR',
  },
  {
    type: RaceType.Marathon,
    name: 'Chicago',
    date: '2022-10-09',
    time: '4:42:25',
    rank: 24_410,
    participants: 39_420,
    state: 'IL',
  },
  {
    type: RaceType.Marathon,
    name: 'Carlsbad',
    date: '2023-01-15',
    time: '3:16:38',
    rank: 51,
    participants: 1053,
    state: 'CA',
  },
  {
    type: RaceType.Marathon,
    name: 'Jack & Jill',
    date: '2023-07-30',
    time: '2:43:35',
    rank: 5,
    participants: 515,
    state: 'WA',
    links: [
      'https://www.athlinks.com/event/379803/results/Event/1055186/Course/2380734/Bib/4003',
    ],
  },
  {
    type: RaceType.Marathon,
    name: 'Boston',
    date: '2023-04-17',
    time: '3:29:55',
    rank: 12233,
    participants: 30000,
    state: 'MA',
    links: [
      'https://results.baa.org/2023/?content=detail&fpid=search&pid=search&idp=9TGHS6FF17D625&lang=EN_CAP&event=R&event_main_group=runner&pidp=start&search%5Bname%5D=Schloesser&search_event=R',
      'https://archive.is/puoHU',
    ],
  },
  {
    type: RaceType.MarathonDnf,
    name: 'Twin Cities',
    date: '2023-10-01',
    reason: DnfReason.Cancelled,
    state: 'MN',
  },
  {
    type: RaceType.Marathon,
    name: 'Chicago',
    date: '2023-10-08',
    time: '3:36:07',
    rank: 12376,
    participants: 48292,
    state: 'IL',
    links: [
      'https://results.chicagomarathon.com/2023/?content=detail&fpid=search&pid=search&idp=9TGG963827C9EC&lang=EN_CAP&event=MAR&search%5Bname%5D=Schloesser&search_event=MAR',
      'https://archive.is/OJ3bt',
    ],
  },
  {
    type: RaceType.Marathon,
    name: 'Seattle',
    date: '2023-11-25',
    time: '2:59:10',
    rank: 52,
    participants: 1723,
    state: 'WA',
    links: [
      'https://results.raceroster.com/v2/en-US/results/9k4gs2zpyympmtxs/detail/3tandg5sbpnewt5h',
      'https://archive.is/wzA7H',
    ],
  },
  {
    type: RaceType.Marathon,
    name: 'Austin',
    date: '2024-02-18',
    time: '2:54:43',
    rank: 26,
    participants: 4002,
    state: 'TX',
    links: [
      'https://www.mychiptime.com/searchevent.php?id=15555',
      'https://archive.ph/omMPM',
    ],
  },
]
