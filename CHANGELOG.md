# Changelog

## 1.95 — Shooting back, fewer street ambushes, airport on the GPS
- Shooting back: on foot, tapping fire now turns to whoever is attacking you, even from behind. Before, only attackers right next to you counted, so a shot from behind made you fire at whatever was in front of you, often a passer-by. Whoever just hurt you gets top priority, and knocked-out people are never targeted.
- Fixed J: it's the fire key, but 1.93 also bound it to hack mode, so shooting kept toggling hacking. Hack mode is now on U.
- Fixed hack mode eating your touches. With it on, taps on the fire button or joystick could be taken as hack selections.
- Fixed gangs blaming you for their own truck wrecks. Since 1.92, any gang supply truck that crashed or lost its driver counted as your hit: −20 rep, a citywide grudge, and every member nearby opened fire. Only hits you actually cause count now.
- Hideout guards only react when you're actually at their door, not when you walk past on the street. When they do react, only those guards fight; the whole gang doesn't come after you.
- Saves from 1.92–1.94 get a one-time amnesty: any gang at "wants you dead" because of the truck bug cools off to wary, and hunts and grudges reset.
- Fewer ambushes in general:
  - Hit squads need a bigger grudge and come at most every 4 minutes, never within 2 minutes of respawning.
  - Grudges fade faster.
  - Killing gang members, or committing crimes in front of them, builds less of a grudge.
  - Gang-vs-gang street fights and shakedowns happen about half as often.
  - Angry drivers pulling a gun: 50% → 20%.
- Result: 21 minutes on gang turf without provoking anyone went from 17–19 attackers to 0.
- GPS (the GPS button) now lists the Airport, Byte Depot, offices for sale, the nearest un-hacked CityNet relay, and Fort Varro.

## 1.94 — A home office in every home
- Every home you own, including your starting apartment, the safehouse and the bunker, now has a home office: a computer desk, an electronics bench and a server rack. They're set up automatically in a free spot the first time you walk in. You can rearrange them from Decorate, but you can't sell them.
- Your office resources are shared everywhere. Every home and office you own is on the same home network:
  - Every computer you own works from the desk in any of your places. There's no more moving PCs between home and office.
  - Your parts bin is at every electronics bench.
  - The server rack's 25% trace reduction applies whichever of your places you work from.
  - Laptops still come with you anywhere.

## 1.93 — Stealth, hacking and electronics
- Stealth: 🥷 SNEAK (or Z) to move quietly. How visible you are depends on light (streetlights, headlights, day or night), cover (bushes, trees) and whether you're moving. An eye meter shows hidden / dim / exposed. Witnesses only spot you if they're facing you, and guards fill a ? meter before they react.
- Silent takedowns: sneak up behind someone and press ✋ TAKEDOWN (or K) to knock them out. They wake up a minute later. If someone sees it, it's assault.
- You can sneak into Fort Varro at night on foot without the alarm going off, until a soldier actually spots you.
- Hacking, Watch Dogs-style. Press 📡 HACK (or J) to turn on the Profiler, and everything your phone can reach lights up. Tap a target to see its card and its hacks. Each hack costs battery segments (they recharge, faster in a car or at home) and takes a moment to upload — faster on a faster phone.
  - People: a profile with name, job, income and a secret. You can skim their bank account, read their texts (gang phones leak supply runs), or ring their phone to distract them.
  - Cars: kill the engine (cop cars too), steer it sideways, unlock and start parked cars with no hotwiring, or set off an alarm as a distraction.
  - The city:
    - Traffic signals: all green for a pile-up, or all red to box traffic in.
    - Steam pipes that throw cars.
    - Streetlight blackouts (they feed stealth).
    - Fire hydrants.
    - ATMs that spit out cash.
    - Vending machines.
    - Payphones you can cut so witnesses can't call it in.
    - Security cameras you can loop. Cameras outside shops now report crimes they see.
    - Police radios you can jam, so cops lose your position for 10 seconds.
- CityNet relay towers (📡 on the map): each city district has one. Break in with a node-routing puzzle — rotate tiles to route the signal — to unlock that district's lights, pipes, cameras and streetlights.
- Hacking skill tree: hacks earn XP and levels give points. Unlock engine kill, distraction, remote steer, radio jam, ATM jackpot, steam pipes, camera loops, an extra battery segment, Focus (slow time), mass skim and neighbourhood blackout.
- Byte Depot: a big-box electronics store downtown.
  - Phones: Kestrel A1 (budget, your starter), Nova 5, Pulse Pro and Cipher X.
  - Computers: Lumen 14 laptop, Officemate desktop, Vista 27 all-in-one, Forge RTX tower and Atlas workstation.
  - Parts, add-ons, consoles and arcade cabinets for your home.
- Devices work like cars and guns:
  - Every phone and computer is its own item, with core parts that each have a tier and wear. Phones have processor, memory, battery, radio and cooling; computers also have graphics and storage.
  - Add-on bays: VPN, exploit suite, signal amp, overclock, police scanner, ghost mode, cracking rig and crypto miner.
  - Any part fits any model, so a budget phone with elite parts and enough cooling outruns a stock flagship. Without the cooling it throttles and cooks its parts.
  - Pull, fit, swap, fix and scrap parts on the bench. Loose parts go in your parts bin. The Tech Bar fits new parts on the spot.
- Offices: buy an office suite. It has computer workstations, a server rack (25% less trace, and you can purge the logs), an electronics bench with your parts bin, and a stash.
- Computers run apps:
  - Marketplace.
  - Freelance gigs: honest work that pays more on a stronger computer and runs in the background.
  - Darknet: phishing, card dumps, ransomware, crypto laundering.
  - Network intrusions, each one a node puzzle:
    - Gang comms, which reveal hideouts and supply runs.
    - Corporate data heist.
    - City power grid blackout.
    - Traffic control.
    - Police records, which wipe your description and take a star off.
    - The Varro Savings & Loan.
  - Neon Drift, an arcade game.
  - Online crime builds Cyber Crimes trace. At 100% they freeze part of your bank account and send units. A VPN and your office's server rack slow it down.
- Consoles and computer desks: place them at home from Decorate after buying them at Byte Depot. Play Neon Drift on a console or arcade cabinet, and use your home computer at the desk.
- Phone: a new 📡 Tech tab shows your phone's battery, range, add-ons and trace, plus all your devices. With a laptop on you, it also gives you the full computer apps anywhere.

## 1.92
- Wanted stars, clearer: one scale again. The number of stars is how hard the city is coming for you; the whole row is one colour for who's coming — blue (🚓 POLICE) for local heat, red (🛡 SWAT RESPONSE) once it's gone tactical (gunfire, killings, armed robbery). No more mixed-colour rows.

## 1.91
- Colour-coded wanted stars: blue stars are local police heat (theft, speeding, fights), red stars are tactical heat (gunfire, killings, armed robbery — the kind that brings SWAT). A mix shows both, in proportion.
- Neighbourhood memory is much shorter: each district forgets one sighting every 2 minutes of play, so a signature ride or outfit wears off within a few minutes of keeping your head down (it used to last hours).

## 1.90 — Living world: factions, heat and witnesses
- Ramming: weight wins. When a heavy vehicle hits a light one, the light one is shoved along with it — its tyres break loose so it slides sideways and spins — and it takes almost all of the damage, while the heavy one keeps its momentum and barely gets scratched. Equal-weight cars still trade equal damage. A tank plows through anything.
- Living factions: every gang with turf runs an economy that ticks whether you're watching or not.
  - Supply drains as they arm their people and refills when a contraband convoy reaches their hideout.
  - Convoys near you are real trucks with an escort (and show on the map). Hit one — wreck it, kill the driver or steal it — and their supply crashes: the escort comes for you, the cargo spills (guns, product, cash), or if you drove off with it you get what's in the back.
  - Low supply means their soldiers turn up with knives and old pistols and their gun dealer charges more or runs dry; flush gangs carry SMGs and rifles.
  - Each gang has a hideout with soldiers outside — you'll find it on the map once you've seen it.
  - On their turf you'll see shakedowns (an extortionist walks into a shop and comes out with the money — stop him and the owner pays you), and street fights with rival gangs they're at war with. Far away, rivals at war jack each other's shipments.
  - Payback: hitting a gang, or killing their people (especially on their turf), makes them hunt you; push it far enough and they send a car full of shooters after you.
- Heat that reacts to how you act: behind the stars there are now two kinds of heat.
  - LOCAL PD (noise, speeding, theft, property damage, fistfights): patrol cars and beat cops — no SWAT, no chopper.
  - TACTICAL (gunfire, killings, armed robbery, explosives): SWAT vans and teams from 2★, and the chopper only joins at 5★ when it's tactical.
  - About one cop in four is corrupt: he'll drop hints, "eyes your wallet" in the bribe dialog (gold BRIBE button), takes bribes far more often, and will take one up to 3★ and for things like armed robbery. Straight cops rarely do.
  - Gangs don't care about the law: violence on their turf in front of their people is what makes them come for you. A tag under the stars shows which gangs are hunting you.
- Witnesses, disguises and memory:
  - Witnesses describe your car (colour and model) and your clothes; when the call goes through, dispatch puts the description out — even if you were long gone.
  - Half of them have no phone and run for the nearest payphone: stop them or get out of sight before they reach it.
  - While the description is out, cops who spot the hot car or the matching outfit recognise you, even at 0★. Ditch or respray the car and change clothes and you don't match any more — stars also fade faster then, and slower while you're in the hot car. Tags under the stars show 🚗 HOT CAR / 👕 OUTFIT DESCRIBED / 🕶 NO MATCH.
  - Laying low inside, unseen, cools you off — fast in your own safehouse or home.
  - Neighbourhoods remember: keep committing crimes in the same ride or outfit in one district and it becomes your signature there — locals and that district's cops know you on sight (👁 KNOWN AROUND HERE). It fades over a few hours.

## 1.89
- Bribing cops: at 1–2 stars, wanted only for minor crimes, a 💵 BRIBE button appears next to SURRENDER when a cop is close (you can also offer one when you talk to a cop). Pick a small or a generous offer, each with its odds shown — cash only, and you only pay if he takes it. If he refuses, "Attempted bribery" goes on your sheet, and each cop only hears one offer. Murder, killing a cop, armed robbery, assaulting police and stealing a cop car can't be bought off.
- You keep your guns: getting wasted or busted, you come back with every gun you were carrying — same guns, same attachments and wear, minus the ammo you fired. Only NPCs drop their guns. (Armor is still lost.)
- Cops wear their uniforms: they no longer get random civilian jackets thrown over them, and a driver bailing out of a cop car comes out as a cop.
- Shops take card: buying at a shop, gun store, garage or dealer uses your pocket cash first, then your bank. The pawn shop, street dealers, tips, bribes and the casino are cash only.
- Tyres: crash damage spread to your car's parts hits the wheels and tyres less, and a badly beaten car you take out of the garage no longer starts with a flat (only a near-wreck does). Getting shot at still pops tyres fast.
- Pets keep up: a following pet runs to stay with you, slides along walls instead of getting stuck, catches up if it falls behind a building, and hops into your vehicle with you — and back out when you get out.
- Fort Varro always has its tanks: two in the motor pool and a third out by the parade ground, parked there whenever you show up (they used to spawn at random and were easy to miss).

## 1.88
- Gun workbench: no more duplicate slots. Barrel / Barrel length, Action / Trigger and Feed / Magazine are now one tile each. Inside the tile a switch flips between the part itself (wear, grade, pull off, swap, fix) and its upgrade (barrel length, trigger, magazine size); each side shows what's on the gun now. The tile gets a "+UP" badge when an upgrade is fitted.
- Gun menus work like the car menu on phones: the card for whatever you've selected — a gun, a spare part, or the slot and option on the bench — is pinned at the bottom with its buttons, and only the grids above it scroll. Applies to the home gun workshop and the gun shop's workbench. The grid keeps its scroll position as you tap through options.

## 1.87
- Slow fixes only happen in storage. A gun you're carrying can't be slow-fixed any more: pay for ⚡ Fix now, or store it at your home gun bench first. Guns in your collection get 🐢 Slow fix (clean & oil on the bench — cheap, takes a few minutes of play), shown with a 🧽 CLEANING badge; tap again to stop. Taking a gun off the bench to carry it stops its cleaning. One gun on the bench at a time.
- Cars work the same way: only garaged cars can be slow-fixed (the garage now says "Slow fix: garage it first" for a car that's out). If you take a car out mid-job, the slow fix pauses and picks back up when you garage it again.
- A carried gun that was already being cleaned before this update is allowed to finish.

## 1.86
- Gun workbench: core parts now come off like car parts. Select a gun's Barrel, Action or Feed slot and tap "🔧 Pull it off → bench" — the part goes on your bench with its wear and grade. A gun with an empty slot shows "NONE" on that slot and won't fire until you fit one ("Your Pistol is missing its barrel — fit one at your gun bench").
- Fitting and swapping are spelled out: tap a spare part under the slot and you get "🔧 Fit it" (empty slot) or "🔁 Swap it in" (the fitted one goes to your bench), plus Fix and Scrap for that spare. The fitted part's card tells you how many spares fit and to tap one to swap it in.
- Attachments say the same: "🔧 Fit it" when the slot is empty, "🔁 Swap it in (old one → bench)" when something's already on it, and "🔧 Pull it off → bench".
- At a gun shop, a new core part is "Buy & swap in" (old part to your bench) or "Buy & fit" if the slot is empty.

## 1.85
- New gun models: every gun now has its own detailed drawing (Glock-style pistol, stainless revolver, hand cannon, Uzi, PDW, pump shotgun, sawn-off, combat shotgun, AK, M4 carbine, LMG with ammo box, hunting rifle, tactical sniper, M14-style marksman rifle, RPG, combat knife, Molotov) with shaded metal, polymer and wood grain. Every attachment shows on the gun: red dots, holo sights, 4× and 8× scopes, lasers and flashlights (with the beam on the workbench), suppressors, compensators, chokes, extended and drum mags, long and short barrels, foregrips, bipods, stocks, and finishes including chrome, gold and camo. Tiles show each individual gun's own attachments and finish.
- Gun workshop rebuilt to work like car parts: one grid of every gun you own — carried and collection — each its own tile, never stacked. Tap a gun for its card: Work on it, Carry it / Store it, ⚡ Fix now (pay gunsmith rates for an instant repair to 100%), 🐢 Slow fix (clean & oil), Strip for parts, and 🗑 Scrap (attachments go back to your bench; tap twice to confirm).
- You can now open and work on any gun in your collection, not just the ones you carry.
- Spare core parts and attachments on the bench are tappable tiles with Fix now and Scrap. Inside a gun, the fitted part and spare parts both get a Fix now button.
- No more tabs across the top when you open a gun — the "‹ Guns" back button is in the title bar. The attachment barrel slot is now called "Barrel length" so it isn't confused with the core barrel.
- The home gun locker holds individual guns (the same ones as your collection), each with its own condition and attachments, instead of stacking by type. Guns stored the old way move over automatically.
- Registers: walking up to a staffed register asks whether you want to talk to the clerk or rob it.
- Robbing a gun shop's register now sets off everyone armed in the store, not just a gunshot.
- People shooting at you after you started trouble (a robbery, a shooting) don't hit each other in the crossfire, and security sides with them — no more gun shop owner shooting the security guard.

## 1.84
- Hoard guns like cars: no more "Keep both" prompt. Buying a gun type you already carry (used or new — gun shops now show "Buy another → collection") puts it straight into your gun collection (up to 99 guns). Guns you pick up off bodies that you already own go there too, after you take the ammo.
- Robbing a register (or a safe, theft, or a killing indoors) only brings the cops if someone living sees it. Empty store, or nobody left standing — nobody calls it in, and you hear "Nobody saw a thing."
- More people coming and going: pedestrians walk out of and into shop, bar, diner and office doors around you, and inside businesses patrons come in, find a spot, and leave.
- Bodies freak people out: anyone who sees a corpse screams, runs (or rushes out of the building) and spreads the panic to people nearby. If you're the killer and you're still around, they call it in on you; otherwise a patrol car comes to look and takes the body away.
- Police actually police the streets now, where you can see it:
  - Traffic stops: drivers who speed, crash into cars or hit people get lit up, pulled over to the curb, and an officer walks up. Most get a ticket; some get cuffed and taken in. Runners are always arrested, and gang drivers may pull a gun.
  - Raids on dealers and gang members: a cruiser rolls up, two officers jump out and take them down.
  - Gang members who beat up civilians get arrested by cops on the spot.
  - Arrested people are cuffed (you'll see the cuffs), walked to a cruiser, put in the back and driven off — "🚓 … was taken into custody."
  - Cops on a job stay on it; if you hit 2 stars they drop it and come for you.

## 1.83
- Guns are individual items with their own parts, like cars. Every gun's bench now starts with its core parts — Frame, Barrel, Action and Feed — each with its own wear bar, ahead of the attachment slots.
- Core parts in three grades: stock, match-grade and competition. Aftermarket barrels tighten spread and add range and damage, actions raise fire rate, magazines add capacity and reload faster; attachments stack on top. Buy & fit at a gun shop, or buy for the bench to stockpile. Swapping a part puts the old one (with its wear and grade) on your bench; spare parts can be scrapped.
- Gun rack: spare guns are their own items. Buying a used gun you already own now offers "Keep both" — it goes on the rack at your home bench, where you can carry it instead of your current one or strip it for its barrel, action, magazine and attachments. Spares can be sold at gun shops and pawn shops.
- Every gun tile (backpack, locker, bench) shows that gun's condition bar.
- Armed NPCs carry their own guns: different models, random attachments and wear by who they are (cops well kept, gangs rough). Kill someone who's holding a gun and it always drops — pick it up to get that exact gun, with its wear and attachments. If you already own one you get the ammo, and a better one goes to your rack. Indoors you take it on the spot.
- Gun shops have 3–5 armed customers, and the clerk keeps a shotgun. Fire a shot in there and everyone opens up on you.
- Aim lock no longer snaps backwards mid-fight: it only picks threats in an arc in front of you; a threat behind you counts only at arm's length.

## 1.82
- Gun workbenches reorganized: your guns are item tiles, not tabs. Open the bench to a grid of your guns (with drawn art and badges for fitted attachments or spare parts that fit), tap one to work on it, and use "‹ All guns" to go back. The home bench also shows your spare parts as tiles. "Customize" at the gun shop still opens that gun directly.

## 1.81
- Gun attachment slots no longer scroll off the side of the screen: all slots show at once in a five-across grid (two rows on a phone), on both the shop workbench and the home gun bench. Empty-slot icons are easier to see.

## 1.80
- Menu overhaul after a full audit of every screen on a phone. One rule everywhere: things (items, guns, attachments, parts, furniture) are icon tiles; places, jobs, services and listings are compact lists with filter chips and drill-in submenus; anything that is a thing shows its drawn icon in lists too.
- Gun attachments (shop workbench and home bench): a slot strip, the options for the selected slot as icon tiles, and one card with Buy & fit / Fit / Take off — all on one screen, no scrolling.
- Car customs: every option is an icon tile. The garage's Add/Swap part picker is tiles with a card.
- Phone › Property › For sale: a compact list with kind filters (homes, businesses, clubs, labs, farms, bunker). Property › Mine: a short list of what you own; tap one to open its own page with management and Sell, and a Back button.
- Aviation, pets, gun repair and gun selling are compact lists again (they need their descriptions). Long shops (parts catalogue, courier shop, vehicles) get a section switcher on phones instead of one endless scroll.
- Fixed: two cars of the same model in a garage were both selected when you tapped one.

## 1.79
- Police air support only joins at 5 wanted stars (was 3), and its door gunner hits less often. It peels away once you're down to 3 stars.
- The police chopper is much easier to bring down: 110 HP (about a rifle magazine), aim lock now picks it up (high priority, longer range, no line-of-sight needed since it's in the air), and your shots hit it over rooftops with a hit area the size of its rotor.

## 1.78
- One look for every menu: stores, the pawn shop, gun shop, markets, pets, bars, furniture, yard, parts orders, the online shop, aviation and more show what they sell as icon tiles with price badges. Tap one for a detail card with its actions (a bottom sheet on phones held upright). Sheets now hug their content instead of always filling half the screen.
- Gun shop redesigned into one grid with category chips (guns, muzzle, optics, lasers, mags, barrels, grips, stocks, ammo…): tap a gun for a card with its art, stats and Buy/Customize, or an attachment to buy it for your bench. Every gun attachment has a drawn icon and a description, including on the home gun bench.
- Garage › Vehicles: fitted parts are icon tiles too.
- Horse racing moved into the casino: the Race book now shows the race running live on a big screen (same race for everyone in a room). High rollers in the casino sell race tips (right about 60% of the time) and offer the other back-room deals. The world racetrack is gone.
- Golf controls reworked: tap or drag on the course to aim, the stick and ◀ ▶ buttons for fine aim, a power meter that fills once and then fades if you hold too long, a blue mark showing the power that reaches the pin, a putter scaled to the putt, yardage on the aim reticle, and a camera that frames each shot.
- Maple Grove: a new suburb just south of the city with family homes, driveways with cars, fenced back yards, swimming pools and a little park.
- Cars look like themselves: per-model body shapes, headlights and tail lights in different styles, two-tone roofs, chrome, stripes and trim, so models are easy to tell apart.
- Six new cars (Pocket kei car, Bel Aire 57 classic with fins, Volta electric, Breeze convertible, Bruiser 70 muscle car, Civita commuter) and five vans (Voyager minivan, Wanderer camper, Tradesman work van, Mr. Frosty ice cream van with its tune, Varro Shuttle).
- No hood, no secret: a car missing a body panel shows its engine bay: inline fours, V6/V8 banks, a supercharger, a turbo, an electric motor, or an empty bay.
- "Straight pipe" is no longer a part you buy: take the exhaust system off and the car runs straight-piped and sounds it. Old straight-piped cars convert automatically.

## 1.77
- The map is bigger: the Far Shore, a strip of new land east and south across The Narrows, reached by eight bridges. It holds Port Calloway (a new town with bars and shops), Seabreeze Plains, Windward Farms (new farms for sale), Cedar Hollow, Mirror Lake, Cider Hills, Granite Bluff and Driftwood Beach. The existing world is untouched, so saves and owned properties carry over.
- Varro Downs: a horse racetrack with a grandstand and crowd, rails, finish post, starting gate, tote board and the Varro Downs Clubhouse bar. A race every ~2 minutes: six drawn horses with silks and numbers gallop two laps, with commentary and a live ticker. Bet Win or Place at the tote window or inside the clubhouse (2 tickets per race, $2,500 max each); payouts are automatic. The house keeps ~15%.
- Varro Links: a playable 9-hole golf course (par 35) with fairways, greens, bunkers, water hazards and trees. Aim with the stick, change club, hold SWING to charge power and release; wind, lies (tee, fairway, rough, sand, green), penalties for water and out of bounds, lip-outs, a scorecard and birdie/eagle calls. $150 green fee at the Starter.
- Club members at the racetrack and golf course chat about shady deals among themselves and offer you a cut: race-fix tips (they work about 60% of the time), 5-minute land flips (grease the inspector for better odds), leaning on a business owner to buy his shop 30% under asking (extortion heat, he may pull a shotgun), briefcase courier runs (sometimes a police sting) and golf wagers. Balanced to beat regular jobs on average but with real losses and heat; offers are rationed with cooldowns and stake caps.
- Alcohol: every bar has a drinks menu (beer, IPA, wine, vodka, whiskey, tequila, cocktails, moonshine, a round for the bar, water, coffee) plus bottles to go. Blood alcohol drives the effects: buzzed (shrug off some damage), tipsy/drunk (double vision, tunnel vision, swaying, wobbly aim and steering), wasted (you may throw up), 0.30+ blackout (wake up somewhere else hours later, maybe robbed). Drunk driving near cops is a DUI. Heavy nights leave a hangover. Drinks at a bar you own are on the house.
- Everything you own shows in green on the map and minimap: icons and building footprints.

## 1.76
- Sell anything you own: homes, farms, businesses, nightclubs, drug labs, the bunker and your first apartment. Sell buttons are in Phone › Property › Mine (a full list, plus one on each property's own page) and in Property › For sale under "Yours — sell".
- Every sale asks twice: a first screen spells out what you get (70% of value plus whatever is in the safe), the garage space you lose, where stored cars go and what stays behind; then a final "Yes, sell it" confirmation.
- You always keep at least one home: the last of your apartment, houses, farms and bunker can't be sold. Selling is also blocked if your cars wouldn't fit in the garages you'd have left.
- Sold your apartment? It goes on the market at $80,000 and you can buy it back. Your spawn point, the "cab home" and GPS home move to one of your other homes.
- New: the Ironwood Bunker ($450,000) in Elk Ridge Forest — an earth-covered concrete bunker with camo netting, a blast door and an antenna. Inside: bunks (sleep to save and spawn), your stash, an ammo locker (three mags per gun at a discount), a gun bench, a police scanner and a generator, plus a 10-vehicle garage. Cops can't follow you in, and your wanted level drains fast while you're down there.
- Fixed: sleeping in a house or farmhouse you bought charged you with trespassing instead of letting you sleep. Beds in any home you own now save the game and set your spawn.

## 1.75
- Garage › Vehicles: the "Loose parts in stock" column is now an icon tile grid (drawn icons, condition bar, count, a green ✓ FITS badge for the selected car) with filter chips (All, Fits this car, Engines, Stock, Performance, Wheels, Body).
- Tapping a loose part opens a card with every action: Fit / Swap onto the selected car, Fix now, Slow fix on the workbench, Sell on the marketplace and Scrap. On phones held upright it's a bottom sheet, like the backpack.
- Fitted parts, the Add/Swap picker and the marketplace's "On your shelf" list show the drawn part icons too.
- Fixed: the first loose part of a kind (for example a worn part that came off a car) landed on the shelf at 100% condition instead of its real condition.

## 1.74
- San Varro Airport out on the prairie: a full runway (09/27 markings, threshold stripes, edge lights that glow at night), apron and taxiways, three hangars, a control tower with a beacon, a windsock, a helipad and a runway level crossing with flashing lights. It's on the map.
- Varro Aviation (talk to Dee at the desk): rent a flight, buy your own aircraft, manage your fleet (GPS, ferry back to the airport, repairs) and a How to fly guide.
- Five aircraft with drawn sprites, spinning props and rotors, nav lights and ground shadows: Skylark 172 light plane, Crop Hawk duster, Starling LX private jet, Hummingbird and Ranger Utility helicopters. Parked ones at the airport can be stolen ("Aircraft theft").
- Planes taxi like cars, take off past their take-off speed while holding ▲ CLIMB, bank to turn, and land on the runway or any open ground; landing too fast, on a roof or in water crashes. Helicopters spin up, lift straight off, hover when you let go of the stick and set down anywhere open.
- Flying: aircraft pass over everything, the camera zooms out with altitude, clouds drift by up high, and an altimeter and take-off hints show on the HUD. Keyboard: R/Q climb, F/E descend.
- Bail out with EXIT: high up you get a parachute, low down you get hurt; an empty aircraft goes down.
- Police air support: a chopper joins the chase at 3★ with a searchlight after dark and a door gunner at 4★. It can be shot down (and they won't like that).
- Aircraft can't be stored in car garages and don't show up in chop lists, shells or car mods.

## 1.73
- 8 new guns: .357 Revolver, Hand Cannon .50, PDW, Sawn-Off Shotgun, Combat Shotgun, Carbine, Light Machine Gun, Marksman Rifle.
- Guns are built from components: frame, barrel, trigger & action and magazine, plus attachments. Optic (red dot, holographic, 4x and 8x scopes) and laser (red, green, laser + flashlight) are now separate slots, with new barrel, grip (foregrip, bipod) and stock slots. Old saves keep their scope/laser.
- Wear: every shot wears the barrel, action, mag and frame. A worn barrel throws wide and short; a worn action or mag misfires. Optics and lasers lose their bonus as they wear.
- Repair: gun shops have a Repair tab (fast, pricey, per component or fix everything), or clean & oil it yourself from the backpack (cheap, ~8 min, the gun can't fire meanwhile).
- Used gun bin at gun shops and pawn shops (restocked daily, real wear and random attachments, trade-ins). Sell guns to gun dealers (55% of value) or pawn shops (40%).
- Laser beam drawn in the world (glows at night); the flashlight lights the way after dark.

## 1.72
- Aim lock rewritten: pressing fire locks the best target (threats first, from any direction when they're close); holding fire keeps that lock no matter what else moves into view; if the target dies you keep shooting straight until you let go. Innocent cars on your facing line no longer steal the lock.
- Police: stealing a skateboard or bike is "Petty theft" ($120), motorcycles and boats have their own charge; repeat charges get diminishing fines (max 4×); unlabeled bumps are "Disorderly conduct" ($100); the total fine is capped at $2,500 per wanted star.

## 1.71
- Fixed: choosing "Meet in person" when buying or selling a part closed the where-to-meet dialog straight away, so in-person part deals never started. Any dialog button that opens a follow-up dialog now keeps it open.

## 1.70
- Phones held upright: selecting an item in the backpack, stash, trunk, farm storage or parts shelf opens its card as a bottom sheet over the lower half of the screen, with the grid scrolling above it. Buttons are full width; tap the handle to close it.
- Parts detail shows condition and actions first, description after.

## 1.69
- Drawn icons for every item: seed packets, butcher-paper meats, plated meals, stew bowls, pies, drug baggies, pill packs, drawn engines (I4/V6/V8/blower/EV), gearboxes, wheels, exhausts, chips, seats and every car-mod part.
- Detailed side-view weapon art; ammo shows as a badge on gun tiles, stack counts as a corner badge.
- A proper description for every item, weapon and car part, shown when you select it.
- Parts shelf rebuilt like the backpack: filter and sort a tile grid, then a detail card with description, condition bar, value and big Fix / Slow fix / Sell / Scrap buttons; workbench queue alongside.
- Fixed "Potatoe/Tomatoe seeds" spelling.

## 1.68
- Grid inventory: backpack, home stash, car trunks and farm storage show items as icon tiles with category filters and sorting. Tap a tile to move 1 / half / all, or press and drag it to the other side. Guns go in the home locker the same way.
- Parts shelf shows loose parts as tiles with a condition bar; tap one for fix / slow fix / sell / scrap.
- Marketplace: finished conversations disappear right away (a "Show finished" toggle brings them back), and the screen refreshes itself after accepting, paying, meeting or when new messages arrive.
- Minimizing the app (or switching tabs) now silences all sound and pauses the game; sound comes back when you return.

## 1.67
- Racing scene: Pinewood Raceway outside town (track races, cash duels, pink slips, betting on heats), street races you start by honking at flagged cars, gang-run car events, and a racing rep ladder from Rookie to King of Varro.
- Fixed: Redline races were stuck on the countdown since 1.34 (a marketplace function had the same name and replaced the race tick).
- Beaters: rough cars in traffic with faded paint, primer panels, rust, cracked glass, smoke and worn parts; much more common in tough districts.
- 8 new cars: Zippa R hot hatch, Homestead wagon, Scarab, Cruzado lowrider, Dirtstorm rally car, Last Ride hearse, Stiletto GT, Old Faithful farm truck.
- Cooking: recipe book shows what's missing and where to get it; stop-the-needle cooking mini-game (perfect = bonus portions); mastering a recipe unlocks auto-cook.
- Yards: country homes and farms can be decorated outside (gardens, grills, pools, hot tubs, sheds, windmills and more).
- Phone: 11 tabs merged into 7 (Home, Work, Property, Vehicles, Marketplace, Shop, Racing) with sub-tabs.
- Fixed: a seized engine could still drive at ~85% speed.
- District and radio banners no longer overlap messages; stale help text updated; farms show their icon in Property.

## 1.66
- Meeting at your place: scammers often block you right away; everyone else is already there (they come inside if you're home).

## 1.65
- Buy and sell parts online with shipping; meeting in person is still an option.
- Scam sellers and buyers still exist, and most look shady: new accounts, no reviews, "pay first", gift cards, fake payment emails.

## 1.64
- No theft charges inside your own home, property or garage.
- Farm tractors park facing away from the silo (they used to be stuck nose-first).

## 1.63
- Buyers only sometimes notice changes made to a car after it was listed; the bigger the change, the likelier.
- In-person haggling: take their offer, meet halfway, counter, or walk away (up to three rounds).
- Cops sprint after, tackle and cuff unarmed violent NPCs, and shoot back at armed ones.

## 1.62
- Fixed a freeze after being thrown out of a building.
- Safety net: repeated crashes inside a building move you outside instead of freezing.

## 1.61
- Cars take 35% less crash damage; most cars are "totaled" (smoking, won't drive) instead of exploding.
- Destroyed cars you own are towed home as burnt-out wrecks (parts 1 to 14%), free.

## 1.60
- Workbench in the garage for slow-fixing loose parts, with progress and sparks.

## 1.59
- Slow fix for loose parts (workbench queue).
- Cars brought out of the garage face the direction of traffic.

## 1.58
- No shooting while picking locks or hotwiring.
- In fights, the auto-aim prefers attackers over bystanders.

## 1.57
- "Fix all" and "Slow fix all" buttons in the garage.

## 1.56
- Anyone who starts trouble indoors gets thrown out; armed security in hospitals, banks, casinos and clubs.
- Self-defence indoors no longer gets you thrown out.

## 1.55
- Parts wear 6 times slower; worn engines misfire and seize at 0%.
- Slow DIY fix: very cheap, takes play time while the car sits in a garage.
- Wrecked cars you love are towed home as wrecks; untitled cars are towed home when you die.

## 1.54
- Mod shops charge labor: fitting costs part + 25%, and repairs cost about 2.2 times the DIY price.
- "Part only" option at mod shops.

## 1.53
- Garage door connecting to your home or business, and "Drive it out" from the garage floor.
- Full price rebalance: cars, homes, parts, weapons, pay and fines on one scale.

## 1.50
- Four new drugs, home cooking for all lab drugs, four new labs.
- Labs as a business: equipment up to level 5, cooks, street crews, raid risk.

## 1.42 to 1.49
- Walk-in garage room with parking bays and parts racks; garage per property (6, 10 or 20 bays).
- Phone master list of vehicles: deliver or move cars between garages; toolbox and parts shelf.
- Part picker popup; USE to enter garage; door cooldown; realistic part and repair prices.

## 1.30 to 1.41
- Every part has a condition, and a car's condition is made of its parts.
- In-person marketplace meetups with scammers you can chase down or report to the cops.
- One part per slot; Parts tab; selling worn parts; insurance; exhaust sounds; car inspections; drive-in garage.
- Rare parts market, modded street cars, NPCs reclaiming their cars, blocking buyers and sellers.

## 1.16 to 1.29
- Garage, marketplace, chop shops, parting out, DMV titles, mechanic titles, forged titles.
- Map icons, street gigs, bolt-action rifles and knives, surrender and arrest with fines.
- Shop interiors with unique layouts, bikes and skateboards, resizable minimap and quick navigation.
- Gun workshop, hotwiring and lock picking, police dealing with violent NPCs.
