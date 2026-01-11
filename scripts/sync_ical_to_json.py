import os
import sys
import json
import datetime as dt
from urllib.request import urlopen, Request


def _unfold_ical(raw: str) -> list[str]:
    lines = raw.splitlines()
    out = []
    for line in lines:
        if not line:
            continue
        if (line.startswith(' ') or line.startswith('\t')) and out:
            out[-1] += line[1:]
        else:
            out.append(line)
    return out


def _parse_dt(value: str) -> dt.date:
    # value examples:
    # - 20260704
    # - 20260111T180338Z
    # - 20260111T180338
    value = value.strip()
    if len(value) >= 8:
        y = int(value[0:4])
        m = int(value[4:6])
        d = int(value[6:8])
        return dt.date(y, m, d)
    raise ValueError(f"Invalid DTSTART/DTEND: {value}")


def _download(url: str) -> str:
    req = Request(url, headers={"User-Agent": "CasaFioreCalendarSync/1.0"})
    with urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', errors='replace')


def _extract_booked_dates(ical_text: str) -> set[str]:
    lines = _unfold_ical(ical_text)

    in_event = False
    cur = {}
    dates = set()

    def flush_event(ev: dict):
        ds = ev.get('DTSTART')
        de = ev.get('DTEND')
        if not ds:
            return

        start = _parse_dt(ds)
        if de:
            end = _parse_dt(de)
        else:
            end = start + dt.timedelta(days=1)

        # DTEND in iCal is typically exclusive for all-day events
        if end <= start:
            end = start + dt.timedelta(days=1)

        day = start
        while day < end:
            dates.add(day.isoformat())
            day += dt.timedelta(days=1)

    for line in lines:
        if line == 'BEGIN:VEVENT':
            in_event = True
            cur = {}
            continue
        if line == 'END:VEVENT':
            if in_event:
                flush_event(cur)
            in_event = False
            cur = {}
            continue

        if not in_event:
            continue

        if ':' not in line:
            continue

        key, val = line.split(':', 1)
        key = key.split(';', 1)[0].strip().upper()
        val = val.strip()

        if key in ('DTSTART', 'DTEND', 'SUMMARY', 'STATUS', 'UID'):
            cur[key] = val

    return dates


def _write_json(path: str, payload: dict):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write('\n')


def main():
    booking_url = os.environ.get('BOOKING_ICAL_URL', '').strip()
    airbnb_url = os.environ.get('AIRBNB_ICAL_URL', '').strip()
    vrbo_url = os.environ.get('VRBO_ICAL_URL', '').strip()

    missing = [k for k, v in (
        ('BOOKING_ICAL_URL', booking_url),
        ('AIRBNB_ICAL_URL', airbnb_url),
        ('VRBO_ICAL_URL', vrbo_url),
    ) if not v]

    if missing:
        print('Missing environment variables:', ', '.join(missing), file=sys.stderr)
        sys.exit(1)

    sources = {
        'booking': booking_url,
        'airbnb': airbnb_url,
        'vrbo': vrbo_url,
    }

    all_booked = set()
    for name, url in sources.items():
        ical = _download(url)
        all_booked |= _extract_booked_dates(ical)

    payload = {
        'generated_at': dt.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z',
        'sources': sources,
        'booked': sorted(all_booked),
    }

    _write_json('data/availability.json', payload)
    _write_json('en/data/availability.json', payload)

    print(f"Wrote availability.json with {len(payload['booked'])} booked dates")


if __name__ == '__main__':
    main()
