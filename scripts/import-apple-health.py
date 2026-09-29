#!/usr/bin/env python3
"""Import race activities from an Apple Health export (Health app -> profile -> Export All Health Data).

    python3 scripts/import-apple-health.py ~/Downloads/export.zip          # write activity JSONs
    python3 scripts/import-apple-health.py ~/Downloads/export.zip --list   # list long runs, to find races

Writes apps/web/src/data/activities/<race-id>.json for every race in RACE_WORKOUTS, from the workout's
route GPX (series), Apple Watch heart-rate samples (joined by time) and step counts (cadence).
No dependencies beyond the Python 3 standard library.
"""

import bisect
import datetime as dt
import io
import math
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from zoneinfo import ZoneInfo

from activity import MARATHON_M, REPORT_HEADER, build_doc, write

HALF_M = MARATHON_M / 2
FIFTY_K_M = 50_000

# The only hand-maintained input: race id -> (workout startDate exactly as export.xml prints it,
# IANA timezone of the race, race distance in metres). export.xml prints every date in the phone's
# offset at export time, not the race's.
RACE_WORKOUTS = {
    '2022-01-22-red-rock-canyon': ('2022-01-22 07:45:03 -0700', 'America/Los_Angeles', MARATHON_M),
    '2022-02-12-mesa': ('2022-02-12 06:30:19 -0700', 'America/Phoenix', MARATHON_M),
    '2022-03-19-chuckanut': ('2022-03-19 08:00:18 -0700', 'America/Los_Angeles', FIFTY_K_M),
    '2022-07-04-foot-traffic-flat': ('2022-07-04 06:13:20 -0700', 'America/Los_Angeles', MARATHON_M),
    '2022-10-09-chicago': ('2022-10-09 06:47:51 -0700', 'America/Chicago', MARATHON_M),
    '2023-01-15-carlsbad': ('2023-01-15 07:15:08 -0700', 'America/Los_Angeles', MARATHON_M),
    '2023-04-17-boston': ('2023-04-17 07:01:22 -0700', 'America/New_York', MARATHON_M),
    '2023-07-30-jack-and-jill': ('2023-07-30 06:43:18 -0700', 'America/Los_Angeles', MARATHON_M),
    '2023-10-01-twin-cities': ('2023-10-01 05:54:58 -0700', 'America/Chicago', MARATHON_M),
    '2023-10-08-chicago': ('2023-10-08 05:40:35 -0700', 'America/Chicago', MARATHON_M),
    '2023-11-26-seattle': ('2023-11-26 08:00:39 -0700', 'America/Los_Angeles', MARATHON_M),
    '2024-01-14-rnr-arizona-half': ('2024-01-14 07:31:14 -0700', 'America/Phoenix', HALF_M),
    '2024-02-18-austin': ('2024-02-18 06:01:31 -0700', 'America/Chicago', MARATHON_M),
    '2024-04-28-eugene': ('2024-04-28 07:00:00 -0700', 'America/Los_Angeles', MARATHON_M),
    '2024-06-22-boise': ('2024-06-22 06:00:09 -0700', 'America/Boise', MARATHON_M),
    '2024-10-06-twin-cities': ('2024-10-06 06:00:19 -0700', 'America/Chicago', MARATHON_M),
}

# A recording shorter than this share of the race distance is marked partial.
PARTIAL_BELOW = 0.95
# GPS fixes with worse horizontal accuracy than this are dropped.
MAX_H_ACC_M = 30
# Heart-rate samples further than this from a route point leave its HR empty.
MAX_HR_GAP_S = 30
HR = 'HKQuantityTypeIdentifierHeartRate'
STEPS = 'HKQuantityTypeIdentifierStepCount'
XML = 'apple_health_export/export.xml'
ATTR = re.compile(r'(\w+)="([^"]*)"')
GPX_NS = {'g': 'http://www.topografix.com/GPX/1/1'}


def parse_date(s):
    return dt.datetime.strptime(s, '%Y-%m-%d %H:%M:%S %z')


def xml_lines(z):
    with z.open(XML) as raw:
        yield from io.TextIOWrapper(raw, encoding='utf-8')


def running_workouts(z):
    """Yield (element, distance m) for every running workout in export.xml."""
    buf = None
    for line in xml_lines(z):
        s = line.lstrip()
        if buf is None:
            if s.startswith('<Workout ') and not s.rstrip().endswith('/>'):
                buf = [line]
            continue
        buf.append(line)
        if not s.startswith('</Workout>'):
            continue
        w = ET.fromstring(''.join(buf))
        buf = None
        if w.get('workoutActivityType') != 'HKWorkoutActivityTypeRunning':
            continue
        stat = next((st for st in w.findall('WorkoutStatistics')
                     if st.get('type') == 'HKQuantityTypeIdentifierDistanceWalkingRunning'), None)
        if stat is None:
            continue
        yield w, to_m(float(stat.get('sum')), stat.get('unit'))


def to_m(value, unit):
    return value * {'mi': 1609.344, 'km': 1000, 'm': 1, 'cm': 0.01}[unit]


def samples(z, windows):
    """Apple Watch HR and step samples inside any (start, end) window: {window: {'hr': [...], 'steps': [...]}}."""
    days = {d.strftime('%Y-%m-%d') for w in windows for d in w}
    out = {w: {'hr': [], 'steps': [], 'device': None} for w in windows}
    for line in xml_lines(z):
        if not line.startswith(' <Record type="HKQuantityTypeIdentifier'):
            continue
        is_hr = line.startswith(f' <Record type="{HR}"')
        if not is_hr and not line.startswith(f' <Record type="{STEPS}"'):
            continue
        i = line.find('startDate="')
        if line[i + 11:i + 21] not in days:
            continue
        a = dict(ATTR.findall(line))
        if 'Watch' not in a['sourceName']:
            continue
        start, end = parse_date(a['startDate']), parse_date(a['endDate'])
        for w0, w1 in windows:
            if w0 <= start <= w1:
                bucket = out[(w0, w1)]
                if is_hr:
                    bucket['hr'].append((start, float(a['value'])))
                    bucket['device'] = bucket['device'] or a.get('device')
                else:
                    bucket['steps'].append((start, end, float(a['value'])))
    for bucket in out.values():
        bucket['hr'].sort()
        bucket['steps'].sort()
    return out


def haversine(lat1, lng1, lat2, lng2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lng2 - lng1) / 2) ** 2
    return 2 * 6_371_000 * math.asin(math.sqrt(a))


def route_points(z, path):
    root = ET.fromstring(z.read('apple_health_export' + path))
    points = []
    for p in root.iterfind('.//g:trkpt', GPX_NS):
        acc = p.find('g:extensions/g:hAcc', GPX_NS)
        if acc is not None and float(acc.text) > MAX_H_ACC_M:
            continue
        ele = p.find('g:ele', GPX_NS)
        time = dt.datetime.fromisoformat(p.find('g:time', GPX_NS).text.replace('Z', '+00:00'))
        points.append((time, float(p.get('lat')), float(p.get('lon')), None if ele is None else float(ele.text)))
    return points


def build_rows(points, start, distance_m, hr, steps):
    # Cumulative GPS distance, scaled to the workout's own (pedometer-corrected) distance.
    gps = [0.0]
    for (_, la0, lo0, _), (_, la1, lo1, _) in zip(points, points[1:]):
        gps.append(gps[-1] + haversine(la0, lo0, la1, lo1))
    scale = distance_m / gps[-1] if gps[-1] else 1

    hr_t = [(s - start).total_seconds() for s, _ in hr]
    step_rate = [((s - start).total_seconds(), (e - start).total_seconds(), v / ((e - s).total_seconds() / 60))
                 for s, e, v in steps if (e - s).total_seconds() >= 3]
    step_t = [s for s, _, _ in step_rate]
    rows = []
    for (time, lat, lng, ele), d in zip(points, gps):
        t = (time - start).total_seconds()
        row = {'t': t, 'd': d * scale, 'lat': lat, 'lng': lng, 'ele': ele, 'hr': None, 'cad': None}
        if hr_t:
            i = bisect.bisect_left(hr_t, t)
            near = [j for j in (i - 1, i) if 0 <= j < len(hr_t) and abs(hr_t[j] - t) <= MAX_HR_GAP_S]
            if near:
                row['hr'] = hr[min(near, key=lambda j: abs(hr_t[j] - t))][1]
        k = bisect.bisect_right(step_t, t) - 1
        if k >= 0 and t <= step_rate[k][1] and 100 <= step_rate[k][2] <= 230:
            row['cad'] = step_rate[k][2]
        rows.append(row)
    return rows


def device(w, watch):
    """The recording app, plus the watch model and OS from its HR samples' device string."""
    m = re.search(r'hardware:(.+?), software:([^,]+)', watch or '')
    return {
        'manufacturer': 'apple',
        'app': w.get('sourceName').replace('’', "'").replace('\xa0', ' '),
        'appVersion': w.get('sourceVersion'),
        'hardware': m and m.group(1),
        'software': m and m.group(2),
    }


def stat(w, kind, attr):
    st = next((s for s in w.findall('WorkoutStatistics') if s.get('type') == f'HKQuantityTypeIdentifier{kind}'), None)
    return None if st is None or st.get(attr) is None else float(st.get(attr))


def meta_m(w, key):
    m = next((e.get('value') for e in w.findall('MetadataEntry') if e.get('key') == key), None)
    if m is None:
        return None
    value, unit = m.split()
    return round(to_m(float(value), unit), 1)


def build(race_id, tz_name, race_m, w, distance_m, points, hr, steps, watch):
    start, end = parse_date(w.get('startDate')), parse_date(w.get('endDate'))
    rows = build_rows(points, start, distance_m, hr, steps)
    hr_vals = [v for _, v in hr]
    timer_s = float(w.get('duration')) * {'min': 60, 's': 1}[w.get('durationUnit')]
    total_steps = sum(v for _, _, v in steps)
    summary = {
        'source': 'apple',
        'activityId': start.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'name': w.get('sourceName').replace('’', "'").replace('\xa0', ' '),
        'start': start.astimezone(ZoneInfo(tz_name)).isoformat(),
        'timezone': tz_name,
        'device': device(w, watch),
        'distanceM': round(distance_m, 1),
        'timerS': round(timer_s),
        'elapsedS': round((end - start).total_seconds()),
        'avgHr': round(stat(w, 'HeartRate', 'average') or (sum(hr_vals) / len(hr_vals) if hr_vals else 0)) or None,
        'maxHr': round(stat(w, 'HeartRate', 'maximum') or max(hr_vals, default=0)) or None,
        'avgCadence': round(total_steps / (timer_s / 60)) if total_steps else None,
        'elevationGainM': meta_m(w, 'HKElevationAscended'),
        'elevationLossM': meta_m(w, 'HKElevationDescended'),
        'calories': round(stat(w, 'ActiveEnergyBurned', 'sum') or 0) or None,
        'gpsPoints': len(points),
        'hrSamples': len(hr),
    }
    if distance_m < PARTIAL_BELOW * race_m:
        summary['partial'] = True
    return build_doc(race_id, summary, [], rows)


def list_runs(z):
    print(f'{"start (export offset)":26} {"km":>6} {"min":>5}  source            route')
    for w, m in running_workouts(z):
        if m >= 20_000:
            route = next((f.get('path') for f in w.iter('FileReference')), '')
            print(f'{w.get("startDate"):26} {m / 1000:6.2f} {float(w.get("duration")):5.0f}  '
                  f'{w.get("sourceName")[:16]:16}  {route}')


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    z = zipfile.ZipFile(sys.argv[1])
    if sys.argv[2:] == ['--list']:
        return list_runs(z)

    wanted = {start: race_id for race_id, (start, _, _) in RACE_WORKOUTS.items()}
    found = {}
    for w, m in running_workouts(z):
        race_id = wanted.get(w.get('startDate'))
        if race_id and w.get('sourceName') != 'Connect':
            found[race_id] = (w, m)
    missing = set(RACE_WORKOUTS) - set(found)
    if missing:
        sys.exit(f'no workout found for {sorted(missing)}')

    windows = {race_id: (parse_date(w.get('startDate')), parse_date(w.get('endDate'))) for race_id, (w, _) in found.items()}
    data = samples(z, list(windows.values()))

    print(REPORT_HEADER)
    for race_id, (_, tz_name, race_m) in RACE_WORKOUTS.items():
        w, m = found[race_id]
        route = next((f.get('path') for f in w.iter('FileReference')), None)
        if route is None:
            sys.exit(f'{race_id}: workout has no route')
        bucket = data[windows[race_id]]
        doc = build(race_id, tz_name, race_m, w, m, route_points(z, route), bucket['hr'], bucket['steps'], bucket['device'])
        print(write(doc))


if __name__ == '__main__':
    main()
