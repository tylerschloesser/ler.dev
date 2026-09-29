"""Shared activity-JSON building for the import-*.py scripts.

Each importer turns its source into rows of {t, d, lat, lng, ele, hr, cad, ...extra} (t = seconds since start,
d = cumulative metres) and passes them to build_doc(), so every activities/<race-id>.json has the same shape.
"""

import bisect
import json
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / 'apps/web/src/data/activities'
SERIES_STEP_M = 50
MARATHON_M = 42195
MILE_M = 1609.344
BASE_COLS = ('t', 'lat', 'lng', 'ele', 'hr', 'cad')
# Sensor columns are left empty where their real samples are further apart than this, rather than
# interpolated across (e.g. a watch that logged only a handful of HR readings). Position, time and
# elevation are always interpolated.
MAX_SENSOR_GAP_M = 250


class Column:
    """Linear interpolation over the non-None values of one column."""

    def __init__(self, xs, ys, max_gap=None):
        pts = [(x, y) for x, y in zip(xs, ys) if y is not None]
        self.xs = [p[0] for p in pts]
        self.ys = [p[1] for p in pts]
        self.max_gap = max_gap

    def at(self, x):
        xs, ys = self.xs, self.ys
        if not xs:
            return None
        i = bisect.bisect_left(xs, x)
        if i < len(xs) and xs[i] == x:
            return ys[i]
        if i == 0 or i == len(xs):
            near = 0 if i == 0 else -1
            return ys[near] if self.max_gap is None or abs(xs[near] - x) <= self.max_gap else None
        x0, x1 = xs[i - 1], xs[i]
        if self.max_gap is not None and x1 - x0 > self.max_gap:
            return None
        return ys[i - 1] if x1 == x0 else ys[i - 1] + (ys[i] - ys[i - 1]) * (x - x0) / (x1 - x0)


class Track:
    """Samples as columns, indexed by strictly increasing cumulative distance."""

    def __init__(self, rows):
        cleaned = []
        for r in rows:
            if r.get('d') is None or (cleaned and r['d'] <= cleaned[-1]['d']):
                continue
            cleaned.append(r)
        self.d = [r['d'] for r in cleaned]
        self.cols = {k: [r.get(k) for r in cleaned] for k in BASE_COLS}
        extra = sorted({k for r in cleaned for k in r} - {'d', *BASE_COLS})
        self.extra = [k for k in extra if any(r.get(k) is not None for r in cleaned)]
        self.cols.update({k: [r.get(k) for r in cleaned] for k in self.extra})
        self._interp = {
            k: Column(self.d, v, None if k in ('t', 'lat', 'lng', 'ele') else MAX_SENSOR_GAP_M)
            for k, v in self.cols.items()
        }

    def at(self, key, d):
        return self._interp[key].at(d)

    def mean(self, key, d0, d1):
        """Time-weighted mean of a column between distances d0 and d1."""
        col, t = self.cols[key], self.cols['t']
        lo = max(bisect.bisect_right(self.d, d0), 1)
        hi = bisect.bisect_left(self.d, d1)
        total = weight = 0.0
        for i in range(lo, min(hi + 1, len(self.d))):
            if col[i] is None:
                continue
            w = t[i] - t[i - 1]
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
        t = track.at('t', d)
        e0, e1 = track.at('ele', prev_d), track.at('ele', d)
        out.append({
            'n': k,
            'distanceM': round(d - prev_d),
            'cumulativeS': round(t),
            'timeS': round(t - prev_t),
            'avgHr': track.mean('hr', prev_d, d),
            'avgCadence': track.mean('cad', prev_d, d),
            'eleDeltaM': None if e0 is None or e1 is None else r1(e1 - e0),
        })
        prev_d, prev_t = d, t
        k += 1
    return out


def series(track):
    stops = list(range(0, int(track.d[-1]), SERIES_STEP_M)) + [track.d[-1]]
    cols = {'d': [round(d) for d in stops]}
    for key in [*BASE_COLS, *track.extra]:
        digits = 5 if key in ('lat', 'lng') else 1 if key == 'ele' else 0
        vals = [track.at(key, d) for d in stops]
        cols[key] = [None if v is None else (round(v, digits) if digits else round(v)) for v in vals]
    return cols


def build_doc(race_id, summary, laps, rows):
    track = Track(rows)
    return {
        'id': race_id,
        'summary': {k: v for k, v in summary.items() if v is not None},
        'laps': laps,
        'splits': {'km': splits(track, 1000), 'mi': splits(track, MILE_M)},
        'series': series(track),
    }


def dump(doc):
    """Indented JSON, but each series column on one line so the file stays small."""
    head = json.dumps({**doc, 'series': '__SERIES__'}, indent=2, ensure_ascii=False)
    cols = ',\n'.join(
        f'    {json.dumps(k)}: {json.dumps(v, separators=(",", ":"))}' for k, v in doc['series'].items()
    )
    return head.replace('"__SERIES__"', '{\n' + cols + '\n  }') + '\n'


def fmt(seconds):
    s = round(seconds)
    return f'{s // 3600}:{s % 3600 // 60:02}:{s % 60:02}'


def write(doc):
    """Write the doc and return its report row."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    text = dump(doc)
    (OUT_DIR / f'{doc["id"]}.json').write_text(text)
    s = doc['summary']
    flag = ''
    if abs(s['distanceM'] - MARATHON_M) / MARATHON_M > 0.05:
        flag = '  (partial)' if s.get('partial') else '  (not marathon distance)'
    return (f'{doc["id"]:38} {s["distanceM"] / 1000:8.2f} {fmt(s["timerS"]):>8} {fmt(s["elapsedS"]):>8} '
            f'{len(doc["series"]["d"]):6} {len(text) / 1024:5.0f}{flag}')


REPORT_HEADER = f'{"race":38} {"dist km":>8} {"timer":>8} {"elapsed":>8} {"points":>6} {"KB":>5}'
