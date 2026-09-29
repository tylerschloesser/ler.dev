#!/usr/bin/env python3
"""Import race activities from a Garmin Connect data export.

    python3 scripts/import-garmin.py ~/Downloads/<export>.zip

Writes apps/web/src/data/activities/<race-id>.json for every race in
RACE_ACTIVITIES. Needs `fitparse` (pip install fitparse); no other deps.
"""

import bisect
import datetime as dt
import io
import json
import sys
import zipfile
from pathlib import Path
from zoneinfo import ZoneInfo

import fitparse

# The only hand-maintained input: race id -> (Garmin activityId, IANA timezone).
RACE_ACTIVITIES = {
    '2024-12-01-seattle': (17666283983, 'America/Los_Angeles'),
    '2025-02-08-mesa': (18224164606, 'America/Phoenix'),
    '2025-04-21-boston': (18894486037, 'America/New_York'),
    '2025-04-26-salt-lake-city': (18942541414, 'America/Denver'),
    '2025-06-08-north-olympic-discovery': (19400741204, 'America/Los_Angeles'),
    '2025-10-26-marine-corps': (20804532372, 'America/New_York'),
    '2025-12-21-chiang-mai': (21310384175, 'Asia/Bangkok'),
    '2026-05-30-fargo': (23069844309, 'America/Chicago'),
}

OUT_DIR = Path(__file__).resolve().parent.parent / 'apps/web/src/data/activities'
SERIES_STEP_M = 50
MARATHON_M = 42195
SEMICIRCLE = 180 / 2**31
MILE_M = 1609.344


def load_export(path):
    z = zipfile.ZipFile(path)
    activities = {}
    for name in z.namelist():
        if name.endswith('_summarizedActivities.json'):
            for a in json.loads(z.read(name))[0]['summarizedActivitiesExport']:
                activities[a['activityId']] = a
    devices = {}
    for name in z.namelist():
        if name.endswith('devicesandcontent.json'):
            for group in json.loads(z.read(name))['deviceAndContentInfo']:
                for d in group.get('Devices', []):
                    devices[int(d['unitId'])] = d
    # Activity FIT files, keyed by session start (ms since epoch, UTC).
    fits = {}
    for name in z.namelist():
        if not (name.split('/')[-1].startswith('UploadedFiles_') and name.endswith('.zip')):
            continue
        inner = zipfile.ZipFile(io.BytesIO(z.read(name)))
        for fit_name in inner.namelist():
            data = inner.read(fit_name)
            try:
                fit = fitparse.FitFile(data)
                if next(fit.get_messages('file_id')).get_value('type') != 'activity':
                    continue
                session = next(fitparse.FitFile(data).get_messages('session'))
            except Exception:
                continue
            start = session.get_value('start_time').replace(tzinfo=dt.timezone.utc)
            fits[int(start.timestamp() * 1000)] = data
    return activities, devices, fits


def values(msg):
    return {k: v for k, v in msg.get_values().items() if v is not None and not str(k).startswith('unknown')}


def num(x):
    return None if x is None else round(x)


def spm(cadence, fractional=0):
    return None if cadence is None else round((cadence + (fractional or 0)) * 2)


def interp(xs, ys, x):
    """Linear interpolation of ys at x, skipping None values in ys."""
    pts = [(a, b) for a, b in zip(xs, ys) if b is not None]
    if not pts:
        return None
    px = [p[0] for p in pts]
    i = bisect.bisect_left(px, x)
    if i == 0:
        return pts[0][1]
    if i == len(pts):
        return pts[-1][1]
    (x0, y0), (x1, y1) = pts[i - 1], pts[i]
    return y0 if x1 == x0 else y0 + (y1 - y0) * (x - x0) / (x1 - x0)


class Track:
    """1 Hz-ish FIT records as columns, indexed by cumulative distance."""

    def __init__(self, records, start):
        rows = [r for r in records if r.get('distance') is not None]
        # Keep distance strictly increasing so it can be an interpolation axis.
        cleaned = []
        for r in rows:
            if cleaned and r['distance'] <= cleaned[-1]['distance']:
                continue
            cleaned.append(r)
        self.d = [r['distance'] for r in cleaned]
        self.t = [(r['timestamp'] - start).total_seconds() for r in cleaned]
        self.lat = [r['position_lat'] * SEMICIRCLE if 'position_lat' in r else None for r in cleaned]
        self.lng = [r['position_long'] * SEMICIRCLE if 'position_long' in r else None for r in cleaned]
        self.ele = [r.get('enhanced_altitude', r.get('altitude')) for r in cleaned]
        self.hr = [r.get('heart_rate') for r in cleaned]
        self.cad = [spm(r.get('cadence'), r.get('fractional_cadence')) for r in cleaned]
        self.extra = {}
        for src, key in [('power', 'power'), ('step_length', 'stride'), ('stance_time', 'gct')]:
            col = [r.get(src) for r in cleaned]
            if any(v is not None for v in col):
                self.extra[key] = col

    def at(self, col, d):
        return interp(self.d, col, d)

    def mean(self, col, d0, d1):
        """Time-weighted mean of col between distances d0 and d1."""
        total = weight = 0.0
        for i in range(1, len(self.d)):
            if self.d[i] <= d0 or self.d[i - 1] >= d1 or col[i] is None:
                continue
            w = self.t[i] - self.t[i - 1]
            total += col[i] * w
            weight += w
        return round(total / weight) if weight else None


def r1(x):
    return None if x is None else round(x, 1)


def splits(track, unit_m):
    out = []
    end = track.d[-1]
    prev_d, prev_t = 0.0, 0.0
    k = 1
    while prev_d < end - 1:
        d = min(k * unit_m, end)
        t = track.at(track.t, d)
        out.append({
            'n': k,
            'distanceM': round(d - prev_d),
            'cumulativeS': round(t),
            'timeS': round(t - prev_t),
            'avgHr': track.mean(track.hr, prev_d, d),
            'avgCadence': track.mean(track.cad, prev_d, d),
            'eleDeltaM': r1(track.at(track.ele, d) - track.at(track.ele, prev_d)) if track.ele[0] is not None else None,
        })
        prev_d, prev_t = d, t
        k += 1
    return out


def series(track):
    cols = {'d': [], 't': [], 'lat': [], 'lng': [], 'ele': [], 'hr': [], 'cad': []}
    cols.update({k: [] for k in track.extra})
    stops = list(range(0, int(track.d[-1]), SERIES_STEP_M)) + [track.d[-1]]
    for d in stops:
        cols['d'].append(round(d))
        cols['t'].append(round(track.at(track.t, d)))
        lat, lng = track.at(track.lat, d), track.at(track.lng, d)
        cols['lat'].append(None if lat is None else round(lat, 5))
        cols['lng'].append(None if lng is None else round(lng, 5))
        cols['ele'].append(r1(track.at(track.ele, d)))
        for key in ['hr', 'cad', *track.extra]:
            src = getattr(track, key) if key in ('hr', 'cad') else track.extra[key]
            v = track.at(src, d)
            cols[key].append(None if v is None else round(v))
    return cols


def build(race_id, activity_id, tz_name, activity, devices, fit_data):
    fit = fitparse.FitFile(fit_data)
    session = values(next(fit.get_messages('session')))
    laps = [values(m) for m in fit.get_messages('lap')]
    records = [values(m) for m in fit.get_messages('record')]
    creator = next((values(m) for m in fitparse.FitFile(fit_data).get_messages('device_info')
                    if m.get_value('device_index') == 'creator'), {})

    start_utc = session['start_time'].replace(tzinfo=dt.timezone.utc)
    start_local = start_utc.astimezone(ZoneInfo(tz_name))
    garmin_offset_h = (activity['startTimeLocal'] - activity['startTimeGmt']) / 3.6e6
    tz_offset_h = start_local.utcoffset().total_seconds() / 3600
    if garmin_offset_h != tz_offset_h:
        sys.exit(f'{race_id}: {tz_name} is UTC{tz_offset_h:+}, Garmin says UTC{garmin_offset_h:+}')

    track = Track(records, session['start_time'])
    zones = [activity.get(f'hrTimeInZone_{i}') for i in range(6)]
    device = devices.get(activity.get('deviceId'), {})

    def cm(key, fallback=None):
        v = activity.get(key)
        return round(v / 100, 1) if v is not None else fallback

    def ms(key, fallback=None):
        v = activity.get(key)
        return round(v / 1000) if v is not None else fallback

    distance = cm('distance', session.get('total_distance'))
    summary = {
        'source': 'garmin',
        'activityId': str(activity_id),
        'name': activity.get('name'),
        'start': start_local.isoformat(),
        'timezone': tz_name,
        'device': {
            'manufacturer': creator.get('manufacturer'),
            'product': creator.get('garmin_product'),
            'partNumber': device.get('partNumber'),
            'software': creator.get('software_version'),
        },
        'distanceM': distance,
        'timerS': ms('duration', round(session['total_timer_time'])),
        'elapsedS': ms('elapsedDuration', round(session['total_elapsed_time'])),
        'movingS': ms('movingDuration'),
        'avgHr': num(activity.get('avgHr', session.get('avg_heart_rate'))),
        'maxHr': num(activity.get('maxHr', session.get('max_heart_rate'))),
        'avgCadence': spm(session.get('avg_running_cadence'), session.get('avg_fractional_cadence')),
        'maxCadence': spm(session.get('max_running_cadence'), session.get('max_fractional_cadence')),
        'avgStrideM': round(activity['avgStrideLength'] / 100, 2) if activity.get('avgStrideLength') else None,
        'elevationGainM': cm('elevationGain', session.get('total_ascent')),
        'elevationLossM': cm('elevationLoss', session.get('total_descent')),
        'calories': session.get('total_calories'),
        'vo2max': num(activity.get('vO2MaxValue')),
        # Index 0 is time below zone 1.
        'hrZonesS': [round(z / 1000) for z in zones] if all(z is not None for z in zones) else None,
    }
    if distance < 0.95 * MARATHON_M:
        summary['partial'] = True

    lap_rows = []
    for i, lap in enumerate(laps):
        lap_rows.append({
            'n': i + 1,
            'distanceM': r1(lap.get('total_distance')),
            'timeS': r1(lap.get('total_timer_time')),
            'avgHr': lap.get('avg_heart_rate'),
            'maxHr': lap.get('max_heart_rate'),
            'avgCadence': spm(lap.get('avg_running_cadence'), lap.get('avg_fractional_cadence')),
            'gainM': lap.get('total_ascent'),
            'lossM': lap.get('total_descent'),
        })

    return {
        'id': race_id,
        'summary': {k: v for k, v in summary.items() if v is not None},
        'laps': lap_rows,
        'splits': {'km': splits(track, 1000), 'mi': splits(track, MILE_M)},
        'series': series(track),
    }


def dump(doc):
    """Indented JSON, but each series column on one line so the file stays small."""
    series_cols = doc['series']
    head = json.dumps({**doc, 'series': '__SERIES__'}, indent=2)
    cols = ',\n'.join(f'    {json.dumps(k)}: {json.dumps(v, separators=(",", ":"))}' for k, v in series_cols.items())
    return head.replace('"__SERIES__"', '{\n' + cols + '\n  }') + '\n'


def fmt(seconds):
    s = round(seconds)
    return f'{s // 3600}:{s % 3600 // 60:02}:{s % 60:02}'


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    activities, devices, fits = load_export(sys.argv[1])
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f'{"race":38} {"dist km":>8} {"timer":>8} {"elapsed":>8} {"proj 42.195":>11} {"points":>6} {"KB":>5}')
    for race_id, (activity_id, tz_name) in RACE_ACTIVITIES.items():
        activity = activities[activity_id]
        fit_data = fits.get(activity['beginTimestamp'])
        if fit_data is None:
            sys.exit(f'{race_id}: no FIT file with start {activity["beginTimestamp"]}')
        doc = build(race_id, activity_id, tz_name, activity, devices, fit_data)
        text = dump(doc)
        (OUT_DIR / f'{race_id}.json').write_text(text)
        s = doc['summary']
        flag = ''
        if abs(s['distanceM'] - MARATHON_M) / MARATHON_M > 0.05:
            flag = '  (partial)' if s.get('partial') else '  <-- distance off by >5%'
        print(f'{race_id:38} {s["distanceM"] / 1000:8.2f} {fmt(s["timerS"]):>8} {fmt(s["elapsedS"]):>8} '
              f'{fmt(s["timerS"] * MARATHON_M / s["distanceM"]):>11} {len(doc["series"]["d"]):6} '
              f'{len(text) / 1024:5.0f}{flag}')


if __name__ == '__main__':
    main()
