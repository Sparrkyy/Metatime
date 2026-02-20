# metatime

A clock that tells you the *correct* time — where "correct" means whatever fraction of the way through the current daylight or darkness period you are, displayed as a 12-hour clock face.

This is a long-running bit between me and my friends. The concept: instead of arbitrary hours, what if your clock just tracked where you are in the day/night cycle? Sunrise to sunset = 12 meta-hours. Sunset to sunrise = 12 meta-hours. Your local sun dictates the time. Very natural. Completely impractical.

## what it does

- Asks for your location
- Calculates local sunrise/sunset using [suncalc](https://github.com/mourner/suncalc)
- Stretches or compresses time so the current daylight or nighttime period always spans exactly 12 meta-hours
- Displays this on a 3D clock (Three.js) that transitions between a day and night theme

## what it doesn't do

- Tell you when to catch a flight
- Sync with anyone else's clock
- Have any practical use whatsoever

## running it

```bash
npm install
npm run dev
```
