# Česká maltézská mládež

Website of Česká maltézská mládež (Czech Maltese Youth), a work of the Czech Grand Priory of the Sovereign Military Hospitaller Order of St. John of Jerusalem of Rhodes and of Malta.

The site is static. A Python script (standard library only) turns the files in `content/` into plain HTML in `dist/`. The code, design and security settings come from the Grand Priory's site (maltezskyrad.cz).

```sh
python3 build.py serve 8000      # preview build, then serve it at http://localhost:8000
python3 build.py --production    # production build (see docs/deployment.md)
python3 check.py                 # checks dist/: links, headings, descriptions, brand assets, acronyms
```
