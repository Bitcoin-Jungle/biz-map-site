# BJ → BTC Map dedup / real-gap analysis

Generated against live data. Source: old Strapi `/api/list` (583 merchants). Target: BTC Map `/v4/places` CR bbox (422 places).

## Summary
| Bucket | Count | Meaning |
|---|---|---|
| **MATCH** | 213 | Already in BTC Map — needs only the `payment:bitcoin-jungle=yes` tag added to the existing OSM element |
| **REVIEW** | 15 | Ambiguous (close OR name-similar, not both) — needs a human to decide match vs. new |
| **NEW** | 355 | No candidate found — net-new OSM creation via Gitea ticket |

MATCH confirmed by website: 116, by phone: 105, rest by name+proximity.
Of the 213 MATCH, 0 already carry `payment_provider=bitcoin-jungle`; **213** still need the tag.

**Real import gap = NEW (355) + whatever REVIEW (15) resolves to new.** Lower bound 355, upper bound 370.

## MATCH — tag existing element, do NOT create duplicate
| BJ merchant | BJ coords | BTC Map match (osm_id) | dist | name~ | signal |
|---|---|---|---|---|---|
| Whale Tail Hotel | 9.1744,-83.7352 | Whale Tail Hotel (way:1057735759) | 22m | 1.00 | website |
| Sibu Cafe | 9.1715,-83.7392 | Sibu Restaurant & Coffee Store (node:4983363421) | 21m | 1.00 | website |
| Farmacia Farmar | 9.2559,-83.8636 | El Pescado Loco (node:12441164428) | 109m | 0.00 | website |
| Tropical Beach Hotel | 9.1537,-83.7375 | Tropical Beach Hotel (node:10542810071) | 13m | 1.00 | website |
| Lavacarros Beats | 9.3218,-83.6689 | Lavacarros Beats (node:12441164424) | 9m | 1.00 | phone |
| Port Vell | 9.6565,-82.7555 | Port Vell (node:5718556722) | 9m | 1.00 |  |
| The Bakery | 9.1728,-83.7385 | The Bakery (node:10272043206) | 4m | 1.00 | website |
| Oli's Lavacar | 9.3639,-83.7071 | Oli's Lavacar (node:12441164421) | 8m | 1.00 | website |
| Kapi Kapi Chirripo Eco Mercado & Café | 9.4642,-83.6005 | Kapi Kapi (way:1056216395) | 3m | 0.40 | website |
| JB Training | 9.2893,-83.8134 | JB Training Fitness Studio (node:12441164414) | 27m | 0.67 |  |
| Seguras Butcher Shop | 9.1732,-83.7376 | Uvita Print (node:10006828332) | 17m | 0.00 | website |
| Falafel Uvita | 9.1579,-83.7476 | Falafel (node:9423663349) | 10m | 0.67 | phone |
| Fuego Brew Co. | 9.2541,-83.8649 | Fuego Brewing Company (node:5125496721) | 3m | 0.40 | website |
| Uvita Print | 9.1733,-83.7377 | Uvita Print (node:10006828332) | 7m | 1.00 | website |
| Uvita Bali Bosque resort | 9.1927,-83.7357 | Uvita Bali Bosque (node:10006835527) | 160m | 0.86 | website |
| Serendipia Hair Spa | 9.1672,-83.7369 | Serendipia Hair Spa (node:3841397204) | 12m | 1.00 | website |
| Awake Community Center | 9.1719,-83.7340 | Awake (node:10744528805) | 218m | 0.50 | website |
| Tribu Restaurante & Nativos Hotel | 9.1755,-83.7314 | Indómitos Cafe & Bar (node:9438328317) | 193m | 0.00 | website |
| The Baker Bean | 9.1715,-83.7389 | Uvita Print (node:10006828332) | 239m | 0.00 | website |
| Optica Centro Visual | 9.9777,-84.3790 | Centro Visual (node:5296340888) | 10m | 0.80 | website |
| Synergy Retreat Center | 9.1740,-83.7303 | Synergy Costa Rica (way:993786630) | 22m | 0.33 | website |
| Squat Box Nutrition | 9.9324,-84.0775 | Squat Box Nutrition (node:12434675132) | 12m | 1.00 | website |
| El Mercado de Bahía Ballena | 9.1585,-83.7384 | ABC Properties (node:12442590149) | 146m | 0.00 | website |
| Shipwrecked Hostel | 9.1642,-83.7361 | Shipwrecked Hostel (node:10587286205) | 15m | 1.00 | website |
| Phat Noodle | 9.2563,-83.8629 | Phat Noodle (node:4528911489) | 8m | 1.00 | website |
| Lodge Punta Marenco | 8.6869,-83.7062 | Lodge Punta Marenco (way:906113178) | 8m | 1.00 | website |
| Doki Sushi | 10.4452,-85.7665 | Cobak Sushi (node:12559521844) | 29m | 0.50 |  |
| Cabinas Los Laureles | 9.1737,-83.7358 | Cabinas Los Laureles (node:3982521441) | 40m | 1.00 |  |
| Casa Sulára | 9.1757,-83.7463 | Casa Sulára (way:943381923) | 21m | 1.00 | website |
| Jungle Academy | 9.0779,-83.6500 | Jungle Academy (node:10006803881) | 45m | 1.00 |  |
| Uvita Info Center | 9.1713,-83.7387 | Centro de Información Uvita (node:9425965288) | 31m | 0.33 | website |
| Hotel Laguna Arenal | 10.4911,-84.8333 | Hotel Laguna Arenal (node:6338082185) | 103m | 1.00 | website |
| Mosaic Wine Bar & Cafe | 9.1736,-83.7337 | Mosaic Wine and Sushi Bar (node:5567901721) | 4m | 0.80 | website |
| Airport Hotel Villa Margarita | 10.0045,-84.2719 | Villa Margarita (node:3982524263) | 101m | 0.80 | website |
| SOMOS Amor | 9.1731,-83.7374 | SOMOS Amor: Cafe & Elixir Lounge (node:12442590156) | 6m | 0.67 | website |
| Hotel La Colina and Steak house | 9.4132,-84.1561 | La Colina (node:3982524004) | 4m | 0.50 | website |
| La Galería Slow Food | 9.9989,-84.1141 | La Galería Slow Food (node:12434675123) | 4m | 1.00 | website |
| Cafe Vivo Uvita | 9.1736,-83.7352 | Café Vivo Uvita (node:9438328817) | 13m | 1.00 | phone |
| Five Maes | 9.1597,-83.7354 | Le Bistro by Le French Café (node:12442590140) | 202m | 0.00 | website |
| Malena's Massage | 9.2890,-83.8134 | Malena's Massage (node:12441164415) | 37m | 1.00 |  |
| Uvita Gastro Park | 9.1732,-83.7336 | Uvita Gastro Park (way:1348646718) | 71m | 1.00 | phone |
| Cafe Mono Congo | 9.2570,-83.8634 | Cafe Mono Congo (way:379783823) | 28m | 1.00 |  |
| The Living Library Botanical Garden | 9.2873,-83.7710 | The Living Library Botanical Garden (node:12441164418) | 13m | 1.00 | website |
| Seba's Restaurant | 9.1776,-83.7315 | Sebas (node:11815140792) | 5m | 0.00 | website |
| Colina's Wood Fired Steaks And Pizza | 9.4133,-84.1561 | Colina's (node:10069046476) | 28m | 0.40 | website |
| Kamut | 9.1732,-83.7335 | Kamut (node:12442590161) | 74m | 1.00 |  |
| Hotel Peace and Lodge | 9.8974,-85.4662 | Peace & Lodge (node:12434247159) | 255m | 1.00 | website |
| Cafetería1743 | 9.7967,-83.8549 | Cafetería 1743 (node:12434675140) | 28m | 0.00 | website |
| True Surf Dominical | 9.2528,-83.8658 | True Surf School (node:12440931980) | 21m | 0.67 | website |
| Montaña Linda Hostel | 9.7953,-83.8566 | Hotel Montaña Linda (way:1015351829) | 12m | 0.80 |  |
| Seguras Butcher Shop | 9.1732,-83.7376 | Uvita Print (node:10006828332) | 17m | 0.00 | website |
| Somos 4 | 9.1732,-83.7335 | Maka.Y.Que? (node:12442590158) | 319m | 0.00 | website |
| Hotel Reventazón | 9.7941,-83.8548 | Centro Médico Orosi (node:12434675141) | 280m | 0.00 | website |
| Manda La Parada | 9.9354,-84.0499 | Manda La Parada (way:1177919602) | 4m | 1.00 | website |
| Espíritu hobbit house | 9.5848,-84.5395 | Espiritu Glamping (node:12440931979) | 25m | 0.40 |  |
| Hotel La Colina Manuel Antonio | 9.4134,-84.1561 | La Colina (node:3982524004) | 15m | 0.50 | website |
| Magic Solutions Technology  | 9.6163,-84.6301 | Magic Solutions (node:10928058245) | 8m | 0.80 | website |
| Osa de Rio | 9.1763,-83.7296 | Osa de Rio (node:5407177823) | 18m | 1.00 |  |
| Holistic Dental Tinamaste | 9.2994,-83.7821 | Feria Organica Tinamastes (way:396084923) | 163m | 0.00 | website |
| Bazar y bisutería San Rafael | 9.8755,-84.0755 | Bazar y Bisuteria San Rafael (node:12434675119) | 45m | 1.00 | website |
| Dental Sur | 9.3757,-83.7040 | Dental Sur (node:10584536266) | 19m | 1.00 | website |
| Parqueo Paris | 9.9365,-84.0928 | Unnamed (way:380300728) | 7m | 0.00 | phone |
| Ahalya Designs @ahalyadesigns | 10.2986,-85.8406 | Ahalya Designs (node:12434247149) | 5m | 0.80 | website |
| flavorcup coffee | 9.6208,-84.6354 | FlavourCup Coffee (node:12440931976) | 11m | 0.00 | website |
| YAXA | 9.9457,-85.6679 | The Beach Break Yaxa Nosara (way:1119720839) | 18m | 0.50 | website |
| Orlas Salon | 9.1722,-83.7395 | Uvita Print (node:10006828332) | 220m | 0.00 | website |
| Carol's Fantasy | 10.2157,-83.7799 | Carol's Fantasy (node:12434675145) | 15m | 1.00 | website |
| Casa Mandala | 9.6377,-82.7114 | Casa Mandala (node:12440931973) | 27m | 1.00 | website |
| Jardín de Lolita | 9.9320,-84.0671 | El Jardín de Lolita (node:7265515785) | 191m | 1.00 | website |
| Macrobiótica La Terraza Orgánica | 9.7959,-83.8539 | Centro Médico Orosi (node:12434675141) | 138m | 0.00 | website |
| Hotel y Villas Orosi Valley | 9.7957,-83.8538 | Centro Médico Orosi (node:12434675141) | 155m | 0.33 | website |
| Galleria Pura Vida | 9.6388,-85.1631 | Galería Pura Vida (node:12434400815) | 34m | 0.67 | website |
| Terraza de doña Meche | 9.7949,-83.8545 | La Terraza De Doña Meche (node:12434675138) | 11m | 1.00 | phone |
| Metromercados Veggie Market | 9.9917,-84.1491 | Metromercado Veggie Market (way:393519846) | 4m | 0.50 | phone |
| Price Auto Sales | 9.5301,-84.3618 | Price Auto Sales (node:10124361363) | 3m | 1.00 |  |
| Tribe Boutique Hotel | 9.2534,-83.8637 | Tribe Boutique Hotel (node:9416843461) | 9m | 1.00 | website |
| Uvita Scooter Rental  | 9.1714,-83.7390 | Uvita Scooter & Bicycle Rental (node:12442590153) | 14m | 0.86 | website |
| Earthwaking Village | 9.2730,-83.8175 | Earthwalking Village (node:12441164413) | 9m | 0.50 | website |
| Centro Medico Orosi | 9.7967,-83.8548 | Centro Médico Orosi (node:12434675141) | 2m | 1.00 | website |
| AMARA healing therapies & WATSU | 9.6673,-85.0778 | Amara Healing Therapies (node:12434400818) | 3m | 0.86 | website |
| Ecomaste | 9.2898,-83.7752 | Eco Maste (node:12441164419) | 182m | 0.00 | website |
| El Reinas hotel | 10.3338,-85.8459 | Sugar's Monkey (node:3982526758) | 4m | 0.00 | website |
| Denki Records | 9.9326,-84.0595 | Denki Records (node:12434675134) | 18m | 1.00 | website |
| Potrero Brewing Company | 10.4467,-85.7699 | Potrero Brewing Company (node:10212847933) | 21m | 1.00 |  |
| Il Giardino - Pizzeria a la leña | 9.7949,-83.8558 | Il Giardino (node:4350343584) | 4m | 0.80 |  |
| Non-toxic Steps | 9.1733,-83.7359 | Non-toxic steps (node:12602165627) | 12m | 1.00 | website |
| Holistic Dental | 10.6190,-85.4629 | Holistic Dental (node:12434247144) | 12m | 1.00 |  |
| Barbería Royal | 9.9291,-84.1374 | Barbería Royal (node:12434675128) | 18m | 1.00 |  |
| Sala Garbo Cinema | 9.9344,-84.0918 | Sala Garbo (way:369729534) | 4m | 0.80 |  |
| Tagua Café Raíz | 9.0986,-83.6454 | Tagua Café Raiz (node:10984812027) | 17m | 1.00 |  |
| Osa Rentals | 9.1537,-83.7269 | Osa Rental (node:12442590131) | 8m | 0.50 |  |
| Metromercados Veggie Market | 9.9917,-84.1491 | Metromercado Veggie Market (way:393519846) | 8m | 0.50 |  |
| Feria Tinamaste | 9.2983,-83.7829 | Feria Organica Tinamastes (way:396084923) | 20m | 0.40 |  |
| CASA KALANA LUXURY VACATION RENTALS  | 10.1938,-85.8242 | Casa Kalana Luxury Vacation Villas (node:10836962384) | 10m | 0.75 |  |
| Pub Shakespeare | 9.9343,-84.0914 | Shakespeare (node:12434675131) | 10m | 0.67 |  |
| Cafe Cora | 9.1700,-83.7333 | Cafe Cora (node:12442590147) | 46m | 1.00 |  |
| La Roca de Tamarindo | 10.2966,-85.8392 | La Roca de Tamarindo (node:12434247150) | 4m | 1.00 |  |
| Uvita Pirates Hostel | 9.1534,-83.7316 | Uvita Pirates Hostel (way:778482253) | 46m | 1.00 |  |
| Cacao Magic House | 9.2784,-83.7810 | Cacao Magic House (node:12441164417) | 2m | 1.00 | website |
| Green Market | 9.2814,-83.8546 | Green Market Organic (node:12441164412) | 29m | 0.67 |  |
| La Botella de Leche Hostel | 10.2961,-85.8389 | La Botella De Leche (node:3982523602) | 11m | 0.80 |  |
| CORE by Chakfitness | 10.4825,-85.7878 | Core by Chakfitness (node:12434247145) | 73m | 1.00 | website |
| Piramys Hotel & Lounge | 9.2509,-83.8626 | Piramys Life Hostel (node:4739401023) | 14m | 0.40 | phone |
| Restaurante Scala | 9.2159,-83.8104 | Scala (node:8336368217) | 40m | 1.00 | phone |
| Bamboo River House & Hotel | 9.2654,-83.8597 | Bamboo River House Hotel (way:829337935) | 69m | 1.00 | website |
| Maka.Y.Qué? Lifestyle Nutrition | 9.1734,-83.7365 | Maka.Y.Que? (node:12442590158) | 11m | 0.67 | phone |
| Manileño Barbershop & Café  | 9.9206,-84.2407 | Manileño Barbershop (node:12434675118) | 12m | 1.00 | phone |
| Mango Condominiums | 10.2964,-85.8429 | Mango Condos (way:379473974) | 22m | 0.50 | website |
| Flor de Bambu experience  | 9.1762,-83.7311 | Flor de Bambú Experience (node:12442590165) | 32m | 1.00 | phone |
| Moromo Forneria | 9.2552,-83.8637 | Moromo Forneria (node:12440931983) | 9m | 1.00 | phone |
| SODA MIL😋🍔 | 9.9769,-84.0079 | Unnamed (node:12434675120) | 23m | 0.00 | website |
| Los Pollos Sin Cresta | 9.9381,-84.0342 | Los Pollos Sin Cresta (node:12434675135) | 1m | 1.00 | phone |
| AZTECAS | 9.3672,-83.7064 | Aztecas (node:12441164422) | 7m | 1.00 |  |
| AV Law Firm | 9.1668,-83.7367 | AV Law Firm (node:12442590144) | 78m | 1.00 | website |
| FUNERARIA REINA DE LOS ÁNGELES  🇨🇷⚱ | 9.9839,-84.7189 | Funeraria Reina de Los Ángeles (node:7623303792) | 17m | 1.00 | phone |
| Valhalla Café and Bakery  | 9.5284,-84.4385 | Valhalla Danish Cafe & Bakery (way:1237685328) | 6m | 0.80 | website |
| El Facon | 9.6446,-85.1678 | El Facon (node:9352334267) | 14m | 1.00 | phone |
| Lori Restaurant | 9.2534,-83.8640 | Lori Restaurant (node:12440931982) | 7m | 1.00 | website |
| Koji's Japanese Food & Bar | 9.6315,-85.1533 | Koji’s (node:6536380086) | 9m | 0.50 | website |
| Contramarea | 9.1659,-83.7383 | Le Bistro by Le French Café (node:12442590139) | 39m | 0.00 | website |
| Nosara Pickleball | 9.9649,-85.6666 | Nosara Pickleball (node:12434247155) | 6m | 1.00 | website |
| Que MAE with Koji's | 9.6810,-85.2001 | Qué Mae Brewing Company (node:12434400809) | 8m | 0.50 | website |
| Aprisco La Hortensia | 9.1584,-83.7383 | Aprisco La Hortensia (node:12442590136) | 46m | 1.00 | phone |
| Optimal Properties & Exchange | 9.9792,-84.3799 | Optimal Properties (way:486682404) | 286m | 0.80 | website |
| Clínica Integral Philia  | 9.6741,-84.6312 | Clínica Integral Philia (node:12440931975) | 39m | 1.00 | phone |
| Selva Orgánica Café y EcoMercado | 9.2879,-83.8035 | Selva Orgánica Café y EcoMercado (node:12669982761) | 19m | 1.00 | phone |
| Wave Surf Instruction  | 9.2523,-83.8655 | Wave Surf Instruction (node:12440931981) | 91m | 1.00 | phone |
| Julian's Barber Shop | 9.6321,-85.1546 | Julián Barbershop (node:12299872001) | 0m | 0.50 | phone |
| Peacock Bikinis  | 9.9982,-84.1193 | Peacock Bikinis (way:391487203) | 23m | 1.00 | phone |
| Funeraria Reina De Los Ángeles ⚱🇨🇷 | 9.9840,-84.7189 | Funeraria Reina de Los Ángeles (node:7623303792) | 23m | 1.00 | phone |
| Frente al Mar Loft | 9.9747,-84.8458 | Frente al Mar Loft (node:12434675115) | 19m | 1.00 | phone |
| Tico Loco Adventures  | 9.4436,-84.1647 | Tico Loco Adventures (way:833064428) | 235m | 1.00 | website |
| ICO Living Hostel | 9.6418,-85.1646 | ICO Living Hostel (node:12434400814) | 22m | 1.00 |  |
| Casa Colibri  | 9.7824,-83.8458 | Casa Colibrí (node:12434675137) | 8m | 1.00 | phone |
| Royal Palm Interiors | 9.1722,-83.7391 | Royal Palm Interiors (way:379833786) | 17m | 1.00 | website |
| Studio M Salon  | 9.6169,-84.6306 | Studio M Salon (node:12440931977) | 46m | 1.00 |  |
| De Raíz Consciente  | 10.0147,-84.1014 | De Raíz Consciente (node:12434675121) | 7m | 1.00 | website |
| South Surf Costa Rica | 9.1927,-83.7792 | South Surf (node:12441164429) | 18m | 0.50 | website |
| Casa Moderna  | 9.6454,-85.1681 | Casa Moderna (node:12434400813) | 19m | 1.00 | website |
| Tico Lingo Spanish School  | 10.0048,-84.1201 | Tico Lingo Spanish School (node:12434675124) | 15m | 1.00 | website |
| Tienda Hazel (Textile Fabrics & More) | 8.6778,-83.0665 | Tienda Hazel (node:12441164434) | 44m | 0.40 | phone |
| Hands On! | 9.6493,-85.1725 | Hands On! (node:12434400811) | 241m | 1.00 | phone |
| Laboratorio clínico sigma  | 9.4293,-84.1614 | Laboratorio Clínico Six Sigma (node:9435568685) | 16m | 0.86 | website |
| Pizzeria Don Vito CR | 9.9993,-84.1127 | Pizzeria Don Vito CR (node:12434675122) | 134m | 1.00 | phone |
| CASA BUHO | 9.6464,-85.1544 | Casa Búho (node:12434400816) | 57m | 1.00 | phone |
| Bitcoin Jungle Office! | 9.1709,-83.7372 | Bitcoin Jungle (node:11978983821) | 97m | 0.80 | website |
| Mistikal Moon Tarot Astrología | 9.1584,-83.7383 | Kimuk (node:12442590133) | 30m | 0.00 | website |
| Licorera El Cruce | 10.1461,-84.3911 | Licorera El Cruce (node:12434675116) | 12m | 1.00 |  |
| La Cola Gourmet Store | 9.1713,-83.7380 | La Cola Gourmet (node:12442590151) | 28m | 1.00 | phone |
| Fresh fish mariscos | 9.1584,-83.7383 | Fresh Fish Mariscos (node:12442590137) | 39m | 1.00 |  |
| Jomar fish market / pescado mariscos | 9.1586,-83.7384 | Pescado Mariscos (node:12442590132) | 39m | 0.67 |  |
| El Paso | 8.3822,-83.1408 | El Paso (node:12441164436) | 218m | 1.00 | phone |
| Avocado lab  | 9.1763,-83.7312 | Avocado Lab (node:12442590166) | 6m | 1.00 | phone |
| Oro verde eco mercado  | 9.3010,-83.7812 | Unnamed (node:12441164420) | 11m | 0.00 | phone |
| Casa Ker Lumar | 9.1923,-83.7713 | Casa Ker Lumar (node:12441164430) | 25m | 1.00 | website |
| La Casa del Celular | 9.3756,-83.7036 | La casa del Celular (way:1117220342) | 5m | 1.00 | website |
| Poró Café  | 9.1584,-83.7384 | Café Poró (node:12442590135) | 31m | 1.00 | phone |
| Café Poró  | 9.1584,-83.7384 | Café Poró (node:12442590135) | 31m | 1.00 | phone |
| Danyasa Eco-Retreat | 9.2543,-83.8641 | Danyasa Yoga Retreat (node:9419718860) | 22m | 0.67 | phone |
| Black Point Restaurant | 8.6341,-83.1623 | Black Point Ocean Grill Restaurante (node:12441164435) | 68m | 0.67 | phone |
| Ancestral Beauty CR Uvita | 9.1732,-83.7376 | Uvita Scooter & Bicycle Rental (node:12442590153) | 266m | 0.25 | website |
| Elixir Bar: Cafe & Lounge  Calm & Chill (A Kava Lounge) | 9.5795,-84.6079 | Elixir Bar Calm & Chill (A Kava Lounge) (node:12440931978) | 4m | 1.00 | website |
| La Junta Dominical  | 9.2562,-83.8635 | La Junta (node:9420819897) | 35m | 0.67 | phone |
| Jungle Mat | 9.1775,-83.7370 | JungleMat Uvita (node:12442590160) | 17m | 0.00 | website |
| SODA BAHIA_BALLENA | 9.1585,-83.7383 | Soda Bahía Ballena (node:12442590134) | 40m | 1.00 |  |
| Anamaya Resort | 9.6513,-85.0738 | Anamaya Resort (node:3982520188) | 51m | 1.00 | website |
| Kimuk | 9.1586,-83.7386 | Kimuk (node:12442590133) | 62m | 1.00 | website |
| Tico Global autoshop and garage | 9.9203,-84.0735 | Taller Tico Global Automotriz (node:12434675130) | 103m | 0.50 | phone |
| Vargas Medical Center | 9.1717,-83.7378 | Centro Médico Vargas (node:12442590157) | 33m | 0.33 | phone |
| Dreamsea Surf Camp | 10.2964,-85.8237 | Dreamsea Surf Camp (node:12434247151) | 65m | 1.00 | website |
| Kitolin -Nasü | 10.0561,-84.7311 | Kitolin (node:12434675114) | 37m | 0.67 |  |
| EUROTALLER TECNICARVE DYG  | 9.1679,-83.7357 | Serendipia Hair Spa (node:3841397204) | 177m | 0.00 | website |
| Betania Coffee & Bakery | 9.9053,-83.6847 | Betania Coffee & Bakery (node:12434675143) | 18m | 1.00 | website |
| Ecologica Tierra Verde | 9.8820,-83.8002 | Tierra Verde Ecological (node:12434675142) | 78m | 0.67 |  |
| Port Vell restaurante  | 9.6565,-82.7555 | Port Vell (node:5718556722) | 8m | 1.00 |  |
| Pizzeria por el camino | 9.1726,-83.7418 | Pizzería Por el Camino (way:991827487) | 27m | 1.00 | phone |
| Lake Arenal Condos  | 10.5322,-84.9806 | Lake Arenal Condos (way:502511321) | 150m | 1.00 | website |
| Hook liquor store  | 9.6755,-84.6309 | Hook Liquor & Store (node:12440931974) | 7m | 1.00 |  |
| Bar El Estadio  | 9.9980,-84.1235 | Bar Restaurante El Estadio (node:12434675125) | 11m | 1.00 | phone |
| Macizo Parrillada Grill | 9.1755,-83.7332 | Indómitos Cafe & Bar (node:9438328317) | 250m | 0.00 | website |
| Psycho Tuna Costa Rica | 9.1619,-83.7355 | Psycho Tuna Costa Rica (node:12442590141) | 52m | 1.00 | website |
| Onepoint solution | 9.1610,-83.7365 | Five Maes (node:8807244518) | 120m | 0.00 | website |
| Coconut Office | 9.5774,-84.5972 | Coconut Office (node:11002622274) | 63m | 1.00 | website |
| Green Jaguar | 9.6579,-82.7515 | Green Jaguar (node:12831286101) | 111m | 1.00 | phone |
| Uvita Law Firm | 9.1670,-83.7369 | AV Law Firm (node:12442590144) | 96m | 0.67 |  |
| Tail Gift Shop | 9.1714,-83.7390 | Uvita Print (node:10006828332) | 250m | 0.00 | website |
| Eco Feria Dominical  | 9.2553,-83.8632 | Eco Feria Dominical (node:12440931985) | 6m | 1.00 | website |
| Pizzería Mari Uvita | 9.1732,-83.7373 | Uvita Scooter & Bicycle Rental (node:12442590153) | 291m | 0.33 | website |
| Alta Mar Surfboards | 9.1762,-83.7311 | Avocado Lab (node:12442590166) | 27m | 0.00 | website |
| Patio Panaderia | 10.4591,-85.7675 | El Patio (node:12563320714) | 5m | 0.67 |  |
| Casa Botánica de Otoya | 9.9367,-84.0716 | Casa Botanica de Otoya (El Germano) (node:12776668396) | 9m | 0.80 | phone |
| Green House  | 9.1731,-83.7377 | Maka.Y.Que? (node:12442590158) | 152m | 0.00 | website |
| Amor Mediterraneo | 9.2964,-83.7838 | Feria Organica Tinamastes (way:396084923) | 225m | 0.00 | website |
| Osteopathy Costa Rica | 9.2353,-83.8399 | Osteopathy Costa Rica (way:993705782) | 7m | 1.00 | website |
| Farmacia Tamarindo | 10.3042,-85.8381 | Farmacia Tamarindo (way:379474591) | 8m | 1.00 | phone |
| The Green Spot | 10.3086,-85.8309 | The Green Spot (node:12778992107) | 10m | 1.00 |  |
| TICAMAZONIA | 8.6550,-83.2524 | Tropical Beach Front Chalet - TICAmazonia -  Golfo Dulce (node:12776711488) | 83m | 0.29 | phone |
| Bitcoin Boat / Barco Bonito  | 9.8934,-85.5843 | Bitcoin Boat (node:12776700448) | 6m | 0.67 |  |
| Dominicalito Surf Family  | 9.2333,-83.8417 | Dominicalito Surf Family (node:13191555370) | 25m | 1.00 |  |
| Alma Cocina | 9.1595,-83.7384 | Kimuk (node:12442590133) | 133m | 0.00 | website |
| Dualia healing center | 9.2555,-83.8639 | Dualia (way:993552049) | 10m | 0.50 | website |
| Cabo y el fuego | 9.9304,-84.0482 | Cabo & El Fuego (node:13027625255) | 29m | 1.00 | phone |
| Hamburguesas La Corte El Barrio | 10.0152,-84.2429 | Hamburguesas La Corte (way:392817197) | 13m | 0.80 |  |
| Uvita Fitness and Wellness | 9.1731,-83.7376 | Uvita Print (node:10006828332) | 27m | 0.40 |  |
| CLS Autoshop | 9.1668,-83.7362 | Le Bistro by Le French Café (node:12442590139) | 258m | 0.00 | website |
| Trinity motors | 9.1762,-83.7451 | Trinity Motors (node:10130900381) | 192m | 1.00 | phone |
| Casa Las Mariposas | 10.2477,-85.7172 | Casa Las Mariposas (node:12434247152) | 95m | 1.00 | phone |
| Exotic Pizza | 9.1602,-83.7355 | Moto Rental Bahia accesorios y repuestos (node:12442590138) | 154m | 0.00 | website |
| NavaStudio | 9.9344,-84.0577 | NavaStudio (node:13532257675) | 17m | 1.00 | website |
| Mariajuana Restobar Tamarindo | 10.2965,-85.8392 | Mariajuana Restobar Tamarindo (node:12778915099) | 12m | 1.00 |  |
| COYOTE Brunch | 9.6500,-85.1743 | Brekkie (node:12305184763) | 322m | 0.00 | website |
| Boba la Ballena | 9.1569,-83.7397 | Kimuk (node:12442590133) | 249m | 0.00 | website |
| Quantum Cacao | 9.1732,-83.7375 | SOMOS Amor: Cafe & Elixir Lounge (node:12442590156) | 6m | 0.00 | phone |

## REVIEW — human decision needed
| BJ merchant | BJ coords | BTC Map match (osm_id) | dist | name~ | signal |
|---|---|---|---|---|---|
| Bitcoin ATM Edificio Trifami Bldg. Suite 509  (behind Banco Central de Costa Rica) | 9.9349,-84.0797 | Costa Rica Servers (node:13130306983) | 5m | 0.27 |  |
| Dental Clinique CR | 9.9450,-84.1171 | Dental Clinique CR (node:12434675126) | 232m | 1.00 |  |
| Walts Duarte Fotografía | 10.0833,-83.3384 | Walts Duarte Fotografía (node:12440931971) | 330m | 1.00 |  |
| Indomitos café bar- VEGETARIANO/VEGANO | 9.1739,-83.7323 | Indómitos Cafe & Bar (node:9438328317) | 51m | 0.50 |  |
| Chimirol Market | 9.4340,-83.6342 | Chimirol Market (node:12441164425) | 269m | 1.00 |  |
| Santa teresa thai massage  | 9.6455,-85.1669 | Santa Teresa Thai Massage (node:12434400812) | 243m | 1.00 |  |
| Moto Repuestos El Chamo | 9.1606,-83.7353 | Moto Rental Bahia accesorios y repuestos (node:12442590138) | 103m | 0.50 |  |
| Sunset Surf Dominical  | 9.2563,-83.8635 | Eco Feria Dominical (node:12440931985) | 112m | 0.40 |  |
| Dr. Mariana Vargas Nutritionist | 9.3675,-83.7050 | Dra. Mariana Vargas - Nutricionista (node:12441164423) | 58m | 0.50 |  |
| T.H.G BEAUTY HAIR STUDIO | 9.2555,-83.8635 | Beauty & Barbers THG.inc (node:12440931984) | 21m | 0.33 |  |
| Cabinas Hidalgo | 9.0903,-83.6473 | Cabinas y Restaurante Hidalgo's (node:12441164431) | 311m | 1.00 |  |
| Taxi Uvita +506 89892298 | 9.1710,-83.7386 | Centro de Información Uvita (node:9425965288) | 44m | 0.29 |  |
| Barbershop VIP | 10.3074,-85.8059 | Gabriel's Barbershop (node:13120447469) | 176m | 0.50 |  |
| CR Jaco rentals | 9.6146,-84.6249 | Jaco Beach Realty (node:12434675113) | 292m | 0.40 |  |
| Barbershop Osorio Vanegas  | 10.3074,-85.8060 | Gabriel's Barbershop (node:13120447469) | 168m | 0.40 |  |

## NEW — net-new import (create in OSM)
| BJ merchant | BJ coords | nearest pin | dist | name~ |
|---|---|---|---|---|
| Tropical Fruit Nursery | 9.0510,-83.6229 | — |  |  |
| Casa Alma Tropical | 9.1672,-83.7338 | Taller Uvita Osa EUROTALLER TECNICARVE DYG | 205m | 0.00 |
| Vástago Comidas | 9.3618,-83.7199 | — |  |  |
| Heladería Enjoy | 10.3686,-85.7746 | — |  |  |
| P2P Bitcoin Anonimo CR | 9.9945,-84.1312 | — |  |  |
| Redefine Concierge & Relocation | 9.1608,-83.7418 | ABC Properties | 304m | 0.00 |
| Catarata Esmeralda Uvita | 9.1769,-83.7303 | Flor de Bambú Experience | 83m | 0.00 |
| Stinkybee Kombucha | 9.2941,-83.8198 | — |  |  |
| At Essence Healing Center | 9.1742,-83.7359 | Bar & Restaurante Los Laureles | 60m | 0.00 |
| TamaRocks Climbing and Fitness | 10.3351,-85.7937 | TamaRock | 204m | 0.00 |
| Laev  | 10.0831,-84.4739 | — |  |  |
| String piano clases de musica | 9.4569,-83.5983 | — |  |  |
| Agroservicios JyR | 9.1531,-83.7268 | Osa Rental | 52m | 0.00 |
| Oli's Lavacar #2 | 9.3598,-83.6857 | — |  |  |
| Mora, Yglesias & Asociados | 9.9453,-85.6650 | The Beach Break Yaxa Nosara | 342m | 0.00 |
| Terapias Familia Holística | 10.2475,-85.7169 | Casa Las Mariposas | 84m | 0.00 |
| Consultorio Dr. Leguizamón | 9.9124,-84.5211 | — |  |  |
| Botánica  | 9.3362,-83.6690 | — |  |  |
| casasurf | 8.3937,-83.1364 | — |  |  |
| Lucia Boscolo Pasta Artesanal | 9.3817,-83.7051 | — |  |  |
| Jaguarsys | 9.0638,-83.6387 | — |  |  |
| Osteopathy Costa Rica | 9.1785,-83.7382 | JungleMat Uvita | 162m | 0.00 |
| Piano & Sax Professor  | 9.4485,-83.6036 | — |  |  |
| Las Gaviotas #14 | 10.2935,-85.8364 | El Moro Tamarindo | 350m | 0.00 |
| Pacifica Sea Sall Crystals salpacifica.com | 9.2514,-83.8631 | Piramys Life Hostel | 76m | 0.00 |
| Wilson Art | 9.9312,-84.0765 | Squat Box Nutrition | 182m | 0.00 |
| Club Gamer C.R | 9.9916,-83.0319 | — |  |  |
| Mochoiz | 10.4476,-84.0037 | — |  |  |
| Casa del Soul Yoga Space | 9.2809,-83.8151 | — |  |  |
| Academia Acuática Daniel Moreno | 8.7060,-83.8785 | — |  |  |
| VIP culinary experiencies  | 9.1685,-83.7434 | — |  |  |
| Price Auto Sales | 9.1751,-83.7436 | Trinity Motors | 13m | 0.00 |
| Apartamento  para hospedaje  | 9.9813,-84.7974 | — |  |  |
| Trade for God | 9.8790,-83.9396 | — |  |  |
| Inversiones GYZ | 9.4255,-84.1618 | — |  |  |
| Maree Rice Pilates | 9.2911,-83.8737 | — |  |  |
| El Tico Signs | 9.9713,-85.6577 | — |  |  |
| Smart green | 9.3619,-83.7199 | — |  |  |
| Jungle Sense Massage Therapy  | 9.1696,-83.7381 | Bitcoin Jungle | 206m | 0.33 |
| Jungle Fish | 9.2444,-83.7007 | — |  |  |
| Drone Survey Costa Rica  | 9.6337,-84.6333 | — |  |  |
| Beesto Delivery Uvita 8544-7493 | 9.1532,-83.7563 | — |  |  |
| GML Dental | 9.9299,-84.0658 | — |  |  |
| La Artesanal Cafe | 9.6189,-84.6330 | FlavourCup Coffee | 339m | 0.00 |
| Casa del Soul | 9.2801,-83.8163 | — |  |  |
| Spa GV Massages (506) 8301-0027 | 9.1730,-83.7380 | Uvita Print | 38m | 0.00 |
| Pacífica sea salt crystals/ salpacifica.can’t m | 9.2556,-83.8635 | Beauty & Barbers THG.inc | 35m | 0.00 |
| Ferretería El César  | 9.3731,-83.7050 | La casa del Celular | 319m | 0.00 |
| Ambiciosas - Recycling Service | 9.1525,-83.7569 | — |  |  |
| Rasta Express | 9.1694,-83.7360 | Taller Uvita Osa EUROTALLER TECNICARVE DYG | 253m | 0.00 |
| The Method World: holistic therapy  | 9.1566,-83.7321 | — |  |  |
| Evemab - yoga and coach for relationship and love  | 9.2145,-83.8095 | Scala | 230m | 0.00 |
| Esprit id x art gallery | 10.3456,-85.8335 | — |  |  |
| Pranava Om Conservation Center  | 9.6391,-85.1634 | Galería Pura Vida | 81m | 0.00 |
| TiToTec | 10.0154,-84.2098 | Tito Tec | 20m | 0.00 |
| Bitcoin ATM Delimart Store, Distrito Cuarto, Escazu | 9.9397,-84.1558 | — |  |  |
| Revolution Hoops CR | 9.0766,-83.6478 | Jungle Academy | 313m | 0.00 |
| JR Art | 9.9312,-84.0766 | Squat Box Nutrition | 176m | 0.00 |
| Hospedaje Apartamento por noche  | 9.9777,-84.1475 | — |  |  |
| Danny The german Meat guy | 10.4293,-85.0928 | — |  |  |
| Transporte UberTaxi. | 9.9780,-84.8290 | — |  |  |
| Sunset Body Works | 9.1736,-83.7346 | Café Vivo Uvita | 75m | 0.00 |
| At Home Car Detailing | 9.1563,-83.7350 | — |  |  |
| SELAH | 9.3475,-83.9753 | — |  |  |
| FRU TICAS  | 9.2016,-83.7910 | — |  |  |
| CAVERO | 9.9562,-84.1273 | — |  |  |
| Sofie Ka Medium | 8.9964,-83.5963 | — |  |  |
| R.MORA Metal-Madera Furniture | 10.7327,-84.4493 | — |  |  |
| LAM LEGAL | 9.2198,-83.8105 | — |  |  |
| Namaste Wellness Massage | 9.3026,-83.7811 | Unnamed | 195m | 0.00 |
| Synergy Alchemy | 9.3726,-83.6469 | — |  |  |
| Cerro golf #4 rental aparment | 9.9748,-84.1610 | — |  |  |
| Vida Bambú  | 9.1789,-83.7286 | Osa de Rio | 317m | 0.00 |
| Osa Transport | 9.9587,-84.1386 | — |  |  |
| Clare Facio Legal | 9.9413,-84.1586 | — |  |  |
| Transporte privado | 9.1651,-83.7447 | — |  |  |
| Jaco Beach Realty S.A. | 10.1875,-84.5966 | — |  |  |
| Jaco beach realty | 9.1699,-83.7394 | Centro de Información Uvita | 147m | 0.00 |
| NaturAlma Kambo | 9.4558,-83.5964 | — |  |  |
| Coquette’s Armoire  | 9.5390,-84.5526 | — |  |  |
| Tierra fraterna | 9.3501,-83.6220 | — |  |  |
| Moto Repuestos El Chamo | 9.1646,-83.7328 | Apretados el Bambuzal | 350m | 0.00 |
| Osa parrillada  | 8.5344,-83.3012 | — |  |  |
| Bitcoin ATM | 9.9300,-84.1330 | Delimart El Cruce | 85m | 0.00 |
| Electrons plus bodywork  | 9.2355,-83.8444 | — |  |  |
| Glamping Alto los Leones | 9.7792,-83.8012 | — |  |  |
| Uvita Arts Center | 9.1652,-83.7247 | — |  |  |
| Carwash | 9.1643,-83.7164 | — |  |  |
| LILICOCO | 9.1701,-83.7441 | — |  |  |
| Flutterby House | 9.1539,-83.7381 | Tropical Beach Hotel | 56m | 0.00 |
| Mas que Aros y llantas Davi | 9.2236,-83.8385 | — |  |  |
| Casa Nilo  | 9.1701,-83.7442 | — |  |  |
| Mi Despensa  | 10.1613,-83.8871 | — |  |  |
| Mi Despensa | 9.9987,-84.1141 | La Galería Slow Food | 18m | 0.00 |
| Thai Massage | 9.4291,-83.6421 | — |  |  |
| Andy express | 9.1715,-83.7390 | Zaika Indian Cuisine Bar & Grill | 10m | 0.00 |
| Property Management Real Estate | 9.6551,-85.0681 | — |  |  |
| JAPI Travels  | 9.1703,-83.7363 | La Cola Gourmet | 216m | 0.00 |
| EF Personal Training | 9.9345,-84.1300 | — |  |  |
| Tattoo Arrival artist: David Hidalgo. | 9.4340,-83.6376 | — |  |  |
| InglesconShahee  | 9.3668,-83.6612 | — |  |  |
| Finca Exotica Ecolodge  | 8.4450,-83.4555 | — |  |  |
| ABC Properties CR | 9.1793,-83.7499 | — |  |  |
| THIGOLITH additives for construction | 9.9359,-84.1944 | — |  |  |
| Greivin’s barber studio | 9.9272,-84.1315 | Delimart El Cruce | 338m | 0.00 |
| Mausoutdoors | 9.4294,-84.1612 | Laboratorio Clínico Six Sigma | 6m | 0.00 |
| Sinaí airbnb | 9.3740,-83.6945 | — |  |  |
| Namaste Wellness CR | 9.1846,-83.7313 | — |  |  |
| GreenChain | 9.9936,-84.1321 | — |  |  |
| Chronovisor | 9.9419,-84.0842 | — |  |  |
| Orgánika Costa Rica | 9.6623,-85.0756 | — |  |  |
| El Laboratorio de Idiomas 506 | 9.0808,-83.6208 | Unnamed | 179m | 0.00 |
| Apretados el Bambuzal (Ice cream) | 9.1757,-83.7292 | Osa de Rio | 71m | 0.00 |
| Café 5/59 | 9.3957,-83.6997 | — |  |  |
| Uvita Surf and Tour  | 9.1516,-83.7378 | El Tabernaco | 215m | 0.00 |
| Fabian Barber Shop | 9.8584,-83.9308 | — |  |  |
| Taller Fernández  | 9.2886,-83.8095 | — |  |  |
| Taller Fernández  | 9.2886,-83.8095 | — |  |  |
| Nex ♾️ mining | 9.4198,-83.4367 | — |  |  |
| Machillo express | 9.3737,-83.7020 | La casa del Celular | 276m | 0.00 |
| Machillo express | 9.3737,-83.7017 | La casa del Celular | 298m | 0.00 |
| Integral Roots Contractors | 9.3059,-83.7775 | — |  |  |
| Taller mecánico Fabián  | 9.3876,-83.7067 | — |  |  |
| Outlet Express PZ | 9.3797,-83.7422 | — |  |  |
| Miller Muñoz transporte privado  | 9.1587,-83.7525 | — |  |  |
| Miller Muñoz  | 9.1650,-83.7442 | — |  |  |
| Whale experience - Private chef | 9.1725,-83.7378 | Ancestral Beauty | 73m | 0.00 |
| Puggos restaurante | 9.6614,-85.0885 | Puggo's | 5m | 0.00 |
| Reciclaje Coto Brus  | 8.8393,-82.9785 | — |  |  |
| Ethiopia | 9.3320,-83.6773 | — |  |  |
| Stgbl aire acondicionado  | 9.5641,-83.5084 | — |  |  |
| Dr. Kevin Ruiz : Caribbean Health Services | 9.7444,-82.8544 | — |  |  |
| Bit Jungle Driver | 9.3783,-83.7041 | Dental Sur | 277m | 0.00 |
| Nourishing Mama  | 9.1724,-83.7424 | Pizzería Por el Camino | 96m | 0.00 |
| KRATOMTICO | 8.5282,-83.3004 | — |  |  |
| Comidas rápidas MAMY MAYRA | 10.0300,-83.3031 | — |  |  |
| Dr Sonrisa | 9.9452,-84.1196 | — |  |  |
| LuvBurger | 9.9437,-85.6656 | — |  |  |
| EcoSardinal | 10.1666,-84.8026 | — |  |  |
| Sabri studio | 9.8254,-83.3453 | — |  |  |
| Osteopathic treatment  | 9.6414,-85.1653 | Eso Santa Teresa Hotel | 38m | 0.00 |
| Tico global  | 8.8159,-83.2843 | — |  |  |
| Tico Global Automotive Service  | 9.9202,-84.0966 | — |  |  |
| Elegancia Luxury - Real Estate & Services | 9.6284,-85.1497 | — |  |  |
| El Patio Restaurant/Bar/AirB&B | 10.0708,-84.4347 | — |  |  |
| Aires acondicionados  | 9.3475,-83.9752 | — |  |  |
| El Pescado Loco Taco Shack | 9.1937,-83.7797 | South Surf | 109m | 0.00 |
| HyJ pago de servicios publicos | 9.5391,-83.6538 | — |  |  |
| Villas Pura Vida  | 9.6702,-85.1462 | — |  |  |
| Sabri Studio  | 10.3927,-84.3750 | — |  |  |
| Livingwell | 9.5506,-83.6599 | — |  |  |
| Elev8 Health | 9.8242,-84.2775 | — |  |  |
| El Mango Breakfast | 9.1591,-83.7412 | Academia Acuática Daniel Moreno | 168m | 0.00 |
| Cab Service Kevin  | 9.5973,-85.0924 | — |  |  |
| truck transport  | 9.6133,-84.6280 | Jaco Beach Realty | 205m | 0.00 |
| jaco transport  | 9.1631,-83.7569 | — |  |  |
| Fragata Tours | 9.1552,-83.7482 | Falafel | 298m | 0.00 |
| Transportes campos | 9.1552,-83.7451 | — |  |  |
| field trips  | 9.6103,-84.6270 | Jaco Culture Tours | 216m | 0.00 |
| Café Florida | 9.2358,-83.7620 | — |  |  |
| Cab Service Kevin | 9.6280,-85.1502 | — |  |  |
| Montezuma Adventure  | 9.6280,-85.1502 | — |  |  |
| Tamarindo Sunset Private Villa | 10.2939,-85.8383 | La Roca de Tamarindo | 312m | 0.33 |
| Bonsái Landscaping-Design  | 9.4574,-83.5977 | — |  |  |
| EYA natural tourims  | 9.4298,-83.8436 | — |  |  |
| Coco’s Restaurant | 9.2518,-83.8642 | Shak'shuka | 186m | 0.00 |
| Coco’s Hotel | 9.2520,-83.8642 | Shak'shuka | 161m | 0.00 |
| Cookie Store | 9.8651,-83.9286 | — |  |  |
| HOMIE SHUTTLE AERÓDROMOS CRC 🇨🇷🛫 | 10.0002,-84.2022 | — |  |  |
| Gestión Legal Corp | 9.9360,-84.0966 | — |  |  |
| Mr & Mrs Brows | 9.9391,-84.1017 | — |  |  |
| Osa Jet Ski | 9.0674,-83.6496 | — |  |  |
| Osa Jet Ski | 9.0695,-83.6539 | — |  |  |
| Casa Otorongo | 9.6734,-85.1933 | — |  |  |
| Potz bistro | 9.0759,-83.6535 | L'Epicerie | 119m | 0.00 |
| Osa fast Luxury Private Transfer | 9.1750,-83.7393 | Uvita Print | 252m | 0.00 |
| CLASS Law & Accounting Firm | 9.1737,-83.7357 | Whale Tail Brewery | 11m | 0.00 |
| Sajihi HOMIE SHUTTLE AERÓDROMOS  | 9.9933,-84.2180 | — |  |  |
| Costa Rica Dive & Surf | 9.1568,-83.7478 | Falafel | 120m | 0.00 |
| Hotel Villa Montana | 9.6203,-84.6358 | FlavourCup Coffee | 64m | 0.00 |
| Ailana Sound Healing | 9.6273,-82.7007 | — |  |  |
| Johnny loves nature Ecotour | 10.3289,-84.8281 | — |  |  |
| Stone Tattoos  | 10.5481,-85.6953 | — |  |  |
| Casa Botánica Collection Barrio Aranjuez | 9.9392,-84.0679 | — |  |  |
| TITOTEC | 10.0154,-84.2097 | Tito Tec | 23m | 0.00 |
| Bodhi Acupuncture | 9.2352,-83.8400 | Osteopathy Costa Rica | 24m | 0.00 |
| Altamar Surfboards | 9.1762,-83.7308 | Flor de Bambú Experience | 15m | 0.00 |
| The Jungle Temple Agroforest  | 9.6250,-84.3087 | — |  |  |
| Accountant-Minneapolis Bookkeeping Solutions | 9.1714,-83.7383 | Tiempos Café | 30m | 0.00 |
| Duo Rent a Car | 9.2337,-83.8381 | Osteopathy Costa Rica | 261m | 0.00 |
| Miguel surf camp | 9.4453,-84.1800 | — |  |  |
| Exotic Eye Tattoo  | 9.4635,-83.5976 | Kapi Kapi | 334m | 0.00 |
| Yiz lashes barber | 9.9832,-84.0270 | — |  |  |
| Rafiki Safari Lodge | 9.4458,-83.9907 | — |  |  |
| India care dog center | 10.5439,-85.6925 | — |  |  |
| Feelovesophy  | 9.1542,-83.7374 | Tropical Beach Hotel | 57m | 0.00 |
| EcoVida - Cabinas | 9.5230,-84.4357 | — |  |  |
| Onda Experieces | 10.3372,-85.8463 | — |  |  |
| Verduras Distribuidora Torres Sanchez \| Feria La Perla | 10.0064,-84.1262 | — |  |  |
| Sweetiesbycelia  | 9.8828,-85.5286 | Bocados Snack Bar | 134m | 0.00 |
| Transportes privado Uber | 9.2972,-83.7897 | — |  |  |
| Hotel Swell Pavones | 8.3950,-83.1356 | — |  |  |
| El Jardin | 9.9498,-85.6697 | LuvBurger | 100m | 0.00 |
| Taximadriz | 9.1715,-83.7385 | Tiempos Café | 56m | 0.00 |
| Transportes / Taxi Eduardo Madriz  | 9.1711,-83.7390 | Centro de Información Uvita | 5m | 0.00 |
| Stone travels | 9.1719,-83.7328 | Kamut | 90m | 0.00 |
| Osa Windows cleaning  | 9.1578,-83.7435 | Academia Acuática Daniel Moreno | 197m | 0.00 |
| Los Higuerones | 8.5293,-83.3032 | — |  |  |
| Vista Mundo | 10.0035,-84.4839 | — |  |  |
| Hello Mocca Pet Shop | 9.1660,-83.7356 | Taller Uvita Osa EUROTALLER TECNICARVE DYG | 135m | 0.00 |
| The Jewelry Center  | 9.1745,-83.7310 | Synergy Costa Rica | 105m | 0.00 |
| Pharmacy / Farmacia Ibarra Plaza Alfaro  | 9.1712,-83.7379 | Tiempos Café | 24m | 0.00 |
| Pharmacy / Farmacia Ibarra Domo Uvita | 9.1671,-83.7369 | Serendipia Hair Spa | 21m | 0.00 |
| Seabreeze Aviation | 10.3361,-85.8000 | — |  |  |
| Brisa Marina Corcovado | 8.5401,-83.3050 | — |  |  |
| COPROT Tortugas de Osa | 8.4120,-83.4243 | — |  |  |
| Restaurante el Jardincito | 9.9334,-85.0020 | — |  |  |
| Río Lindo Hotel & Restaurant | 9.2571,-83.8631 | El Pescado Loco | 47m | 0.00 |
| Portador (taxi) | 9.9899,-84.6666 | — |  |  |
| Sybint Educación Bitcoin  | 9.7514,-84.1428 | — |  |  |
| Pizzeria barco quebrado  | 9.8954,-85.5837 | Bitcoin Boat | 235m | 0.00 |
| El Coyote Playa Buena Vista | 9.8927,-85.5639 | — |  |  |
| CASA BOTANICA | 8.6524,-83.2520 | — |  |  |
| Congo Bongo EcoVillage Manzanillo | 9.5705,-82.6363 | — |  |  |
| Jungle Brothers Tours | 9.6374,-82.6882 | — |  |  |
| Amo y señor | 9.9367,-84.0716 | Casa Botanica de Otoya (El Germano) | 15m | 0.00 |
| Súper San Juan  | 9.8774,-84.0795 | — |  |  |
| Fénix barbería  | 9.1595,-83.7386 | Uvita Bdy Shop | 116m | 0.00 |
| Ritual Café | 9.6031,-85.1408 | — |  |  |
| Quinta Paris | 9.2906,-83.7759 | Eco Maste | 287m | 0.00 |
| COMERCIAL TRINIDAD SUPER Y LICORERA  | 9.8985,-84.6615 | — |  |  |
| ALKIMIA SOLUCIONES | 10.3077,-85.8063 | Gabriel's Barbershop | 123m | 0.00 |
| AI, Automation and Web Services | 9.3663,-83.6964 | — |  |  |
| Armando Valverde Salon | 10.8816,-84.9839 | — |  |  |
| BLANKS | 9.9534,-84.0476 | — |  |  |
| Alex Garage ATV | 9.0508,-83.6230 | — |  |  |
| Puddlefish Brewery  | 9.5993,-84.6173 | — |  |  |
| Famoso Ice Cream | 9.2248,-83.8385 | — |  |  |
| Pardo Café | 9.9366,-84.0717 | Casa Botanica de Otoya (El Germano) | 20m | 0.00 |
| One Frequency Activation | 9.1751,-83.7255 | — |  |  |
| Índigo Drones  | 9.9142,-84.0285 | — |  |  |
| Pizzalogia | 9.7929,-84.0955 | — |  |  |
| Casa bongo | 9.8945,-85.5816 | Bitcoin Boat | 331m | 0.00 |
| Sweet Dreams Gourmet Ice Creams, Samara | 9.8825,-85.5283 | Bocados Snack Bar | 93m | 0.00 |
| Mini Market Calcol | 9.8955,-85.5835 | Bitcoin Boat | 251m | 0.00 |
| Ávila Architecture Studio | 9.1565,-83.7317 | — |  |  |
| Pizzalogia | 9.8965,-84.0692 | — |  |  |
| Miel Dorada - Honey | 9.9406,-84.0686 | — |  |  |
| Art House Atenas | 9.9785,-84.3790 | Centro Visual | 100m | 0.00 |
| Taxi Lizano | 9.1715,-83.7385 | Tiempos Café | 51m | 0.00 |
| Villa Alessandra | 10.4582,-85.7658 | The Sausage Guy | 171m | 0.00 |
| BG LABS  | 9.6704,-84.0145 | — |  |  |
| JR Electronics | 10.0631,-84.1442 | — |  |  |
| Turquesa Hair Lounge  | 9.2351,-83.8399 | Osteopathy Costa Rica | 13m | 0.00 |
| Inversiones el rey  | 9.9063,-84.0913 | — |  |  |
| MAB Design | 9.6326,-85.1576 | Satori | 191m | 0.00 |
| Terapias Naturales NeoHumanas  | 9.9938,-84.1243 | — |  |  |
| Cava Gourmet Market | 9.3413,-83.6733 | — |  |  |
| Sneaky Monkey Artisan Burgers 🍔 | 9.3437,-83.9707 | — |  |  |
| Mango Scoot | 9.4162,-84.1588 | — |  |  |
| Terapias Naturales NeoHumanas | 9.9938,-84.1242 | — |  |  |
| Zenka Healing House  | 9.6571,-85.0932 | — |  |  |
| BnB Casa Manglar  | 9.0374,-83.6045 | — |  |  |
| Ferreteria Palmares | 9.1642,-83.7353 | Apretados el Bambuzal | 89m | 0.00 |
| Ferreteria Palmares PZ | 9.3207,-83.6661 | Lavacarros Beats | 335m | 0.00 |
| Ghost Storm flex T-Shirts | 9.9331,-84.2201 | — |  |  |
| Smokin Love specialty and smoked meats | 9.6415,-82.7166 | — |  |  |
| DIAZCARVS PHOTOGRAPHY  | 8.6538,-83.2517 | Tropical Beach Front Chalet - TICAmazonia -  Golfo Dulce | 236m | 0.00 |
| Nursing Bienestar CR  | 9.2468,-83.8535 | — |  |  |
| Centro de Carnes Uvita | 9.1684,-83.7413 | — |  |  |
| Villa martina | 9.9007,-85.5299 | — |  |  |
| Abseenergy | 10.1396,-84.1966 | — |  |  |
| Jungle Pickleball | 9.0874,-83.6337 | — |  |  |
| Bula Vida Kava | 9.2567,-83.8633 | El Pescado Loco | 28m | 0.00 |
| Nucleo Sabana  | 9.9433,-84.0975 | — |  |  |
| ThaiBar lounge & bowls | 9.1541,-83.7383 | Tropical Beach Hotel | 84m | 0.00 |
| Fit City | 8.9752,-83.5253 | — |  |  |
| Colo Tico Surfboards | 9.1559,-83.7327 | Uvita Pirates Hostel | 334m | 0.00 |
| Casa Entreverde | 9.1011,-83.6553 | — |  |  |
| Farmacia Costa Ballena/Drugstore | 9.1715,-83.7391 | Zaika Indian Cuisine Bar & Grill | 11m | 0.00 |
| The baquiano -Food  | 10.6769,-84.8167 | — |  |  |
| Torito Express  | 9.0954,-83.6352 | — |  |  |
| CRCanna | 9.4412,-83.5046 | — |  |  |
| CRCANNA | 9.5690,-83.2715 | — |  |  |
| HIC Travel | 9.2523,-83.6170 | — |  |  |
| Guillermo Campos Fotografia  | 10.0826,-84.7253 | — |  |  |
| Villas Punta Uva | 9.6369,-82.6895 | — |  |  |
| HyJ | 9.1670,-83.3293 | — |  |  |
| Jungle Love Lounge | 10.4117,-84.7776 | — |  |  |
| CMFLca Contabilidad | 9.1669,-83.7366 | Serendipia Hair Spa | 59m | 0.00 |
| Yoga Ashram  | 10.2894,-85.8213 | — |  |  |
| Ananda Guesthouse | 11.4844,-85.5198 | — |  |  |
| Muebles Mata | 10.1425,-84.9110 | — |  |  |
| Villa Perico | 10.3035,-85.7950 | — |  |  |
| LaCasita - Bijagua | 10.8051,-85.0606 | — |  |  |
| Aguas termales Gevi / Hot Springs. Restaurant | 9.4707,-83.6043 | — |  |  |
| Coral Dream House | 9.1733,-83.7355 | Whale Tail Brewery | 37m | 0.00 |
| El bosquecito café & bistró | 9.1736,-83.7340 | Mosaic Wine and Sushi Bar | 30m | 0.00 |
| Rico's | 9.6341,-85.1574 | Satori | 240m | 0.00 |
| Blindestudio webdesign | 9.9286,-84.2174 | Barbería New Life | 87m | 0.00 |
| Taylor Lawyer | 9.3337,-83.9594 | — |  |  |
| Kon-Tiki | 9.6553,-82.7652 | — |  |  |
| Super el chamito | 10.0111,-84.1195 | — |  |  |
| Luxury autolavado  | 9.3666,-83.7072 | Aztecas | 101m | 0.00 |
| LifeCultureTravelCostaRica | 9.6575,-82.7551 | Port Vell | 118m | 0.00 |
| TicoJerky  | 9.1613,-83.7409 | ABC Properties | 285m | 0.00 |
| Lemonade & Bitcoin Welcome Center | 9.6575,-82.7551 | Port Vell | 118m | 0.00 |
| Hernandez’shop | 8.6581,-82.9449 | — |  |  |
| Take It Easy | 9.6517,-82.7383 | — |  |  |
| Torres Barber Shop  | 9.3751,-83.7046 | Dental Sur | 96m | 0.00 |
| Casa Pura Vida Magic | 9.9596,-85.6735 | — |  |  |
| Yacuruna Artesanía | 9.9494,-85.6702 | LuvBurger | 42m | 0.00 |
| Mystikos Soda | 9.2334,-83.8376 | Osteopathy Costa Rica | 318m | 0.00 |
| Yasumi Sushi | 9.6495,-85.1735 | Brekkie | 218m | 0.00 |
| Bitcoin yala | 9.4263,-78.9663 | — |  |  |
| Hotel Mirador Osa  | 8.7636,-83.3769 | — |  |  |
| BLANKS | 9.5593,-82.7022 | — |  |  |
| Matriztica Plant Medicine | 10.2038,-85.8112 | — |  |  |
| Natural Superfoods  | 9.6385,-85.1626 | Chicken Joe's | 33m | 0.00 |
| Dr. Kevin Offices  | 9.6423,-82.7196 | — |  |  |
| Adventure Park and Hotel Vista Golfo  | 10.1088,-84.8567 | — |  |  |
| Café Blanco | 9.8658,-85.4773 | — |  |  |
| Desanti Law | 9.9170,-84.1389 | — |  |  |
| Soda Donde Pony | 9.1603,-83.7408 | ABC Properties | 185m | 0.00 |
| BINETIN CR | 9.3700,-83.7055 | Dra. Mariana Vargas - Nutricionista | 270m | 0.00 |
| Espacio Arquis  | 10.0096,-84.1201 | — |  |  |
| caro.lafisio | 9.9218,-84.0425 | — |  |  |
| Dulces de Pasqua  | 9.9349,-84.0718 | Casa Botanica de Otoya (El Germano) | 214m | 0.00 |
| Alouatta Camping & Oasis | 9.7849,-85.2546 | — |  |  |
| Ferretería Iguana Verde (Hardware Store) | 9.1667,-83.7387 | Le Bistro by Le French Café | 87m | 0.00 |
| Clínica dental Goodsmile | 10.0009,-84.1216 | — |  |  |
| Dulce Morena Boutique  | 9.6284,-85.1522 | — |  |  |
| Servicio de trasporte privado rubi  | 8.9823,-83.6299 | — |  |  |
| TAXI CHEREPO  | 9.2532,-83.8665 | Wave Surf Instruction | 62m | 0.00 |
| Varuna plant based  | 9.4026,-84.1528 | — |  |  |
| Polígono Rancho Táctico  | 9.6723,-85.0826 | — |  |  |
| Dreamcatcher Hotel & Villas | 9.6323,-85.1570 | Satori | 134m | 0.00 |
| Viwolf rentals | 9.6285,-85.1509 | — |  |  |
| NO LIMITS TATTOO  | 9.6287,-85.1512 | — |  |  |
| Estación Biológica La Cotinga | 8.6227,-83.4787 | — |  |  |
| BlueMystic Surf School | 9.6289,-85.1513 | — |  |  |
| Piercings by Miloo | 9.6347,-85.1584 | — |  |  |
| Custom Print Shop  | 9.6347,-85.1584 | — |  |  |
| Poligono de tiro Corporación criminologica  | 10.1197,-85.4269 | — |  |  |
| Restaurante Playa el Carmen | 9.6240,-85.1495 | — |  |  |
| Tours Zuñiga | 9.2623,-83.7342 | — |  |  |
| Santa Teresa Pharmacy  | 9.6328,-85.1565 | Satori | 80m | 0.00 |
| Imaginante | 9.2553,-83.8631 | Firefairy Elixirs | 3m | 0.00 |
| Laundry Express | 9.6307,-85.1532 | Koji’s | 104m | 0.00 |
| Drift Bar and Gallery | 9.6327,-85.1550 | Julián Barbershop | 83m | 0.00 |
| Jota Jota Store | 9.6299,-85.1527 | Koji’s | 192m | 0.00 |
| Ñau'Cells  | 10.4182,-84.4594 | — |  |  |
| Denga Surf Shop | 9.6442,-85.1678 | El Facon | 55m | 0.00 |
| Sloth Laundry | 9.1589,-83.7431 | Academia Acuática Daniel Moreno | 197m | 0.00 |
| Chereposartes | 9.2728,-83.8575 | — |  |  |
