# API Explorer Template

- New **API Explorer** template listing ALL 1400+ public APIs from the [public-apis](https://github.com/public-apis/public-apis) repository across **51 categories**
- Each category section includes working `{{API:}}` blocks for no-auth APIs (click-to-try GET requests)
- APIs requiring authentication listed in reference tables with Auth type, HTTPS status, and CORS info
- Categories include: Animals, Anime, Anti-Malware, Art & Design, Authentication, Blockchain, Books, Business, Calendar, Cloud Storage, Continuous Integration, Cryptocurrency, Currency Exchange, Data Validation, Development, Dictionaries, Documents & Productivity, Email, Entertainment, Environment, Events, Finance, Food & Drink, Games & Comics, Geocoding, Government, Health, Jobs, Machine Learning, Music, News, Open Data, Open Source Projects, Patent, Personality, Phone, Photography, Programming, Science & Math, Security, Shopping, Social, Sports & Fitness, Test Data, Text Analysis, Tracking, Transportation, URL Shorteners, Vehicle, Video, Weather
- Template registered in `templates.js` (new `api-explorer` category with `bi-globe2` icon) and `src/main.js`
- Auto-generated from GitHub raw README via `/tmp/gen-api-template.js` Node.js parser script

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/api-explorer.js` | +3200 (new) | Comprehensive API Explorer template with 1400+ APIs |
| `js/templates.js` | +6 −2 | Register api-explorer category, icon, and template array |
| `src/main.js` | +1 | Import api-explorer.js in template loading phase |
