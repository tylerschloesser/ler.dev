#!/usr/bin/env python3
"""Import race activities from a Garmin Connect data export.

    python3 scripts/import-garmin.py ~/Downloads/<export>.zip

Writes apps/web/src/data/activities/<race-id>.json for every race in
RACE_ACTIVITIES. Needs `fitparse` (pip install fitparse); no other deps.
"""

import datetime as dt
import io
import json
import sys
import zipfile
from zoneinfo import ZoneInfo

import fitparse

from activity import MARATHON_M, REPORT_HEADER, build_doc, r1, write

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

SEMICIRCLE = 180 / 2**31
# A recording shorter than this share of the race distance is marked partial.
PARTIAL_BELOW = 0.95


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


def fit_rows(records, start):
    return [{
        't': (r['timestamp'] - start).total_seconds(),
        'd': r.get('distance'),
        'lat': r['position_lat'] * SEMICIRCLE if 'position_lat' in r else None,
        'lng': r['position_long'] * SEMICIRCLE if 'position_long' in r else None,
        'ele': r.get('enhanced_altitude', r.get('altitude')),
        'hr': r.get('heart_rate'),
        'cad': spm(r.get('cadence'), r.get('fractional_cadence')),
        'power': r.get('power'),
        'stride': r.get('step_length'),
        'gct': r.get('stance_time'),
    } for r in records]


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
    if distance < PARTIAL_BELOW * MARATHON_M:
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

    return build_doc(race_id, summary, lap_rows, fit_rows(records, session['start_time']))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    activities, devices, fits = load_export(sys.argv[1])
    print(REPORT_HEADER)
    for race_id, (activity_id, tz_name) in RACE_ACTIVITIES.items():
        activity = activities[activity_id]
        fit_data = fits.get(activity['beginTimestamp'])
        if fit_data is None:
            sys.exit(f'{race_id}: no FIT file with start {activity["beginTimestamp"]}')
        print(write(build(race_id, activity_id, tz_name, activity, devices, fit_data)))


if __name__ == '__main__':
    main()
