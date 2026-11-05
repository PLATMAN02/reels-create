# World detail: the small things that make a story short feel alive

Studied frame by frame (0.3 s steps) from *An Unstoppable Spear vs an Unbreakable Shield* (@RicksClips3000, 45 s,
158k likes), then checked against 13 more shorts from the same channel (§7). Sound was not studied. Take the craft, never the story, characters or shots. Use this together with
[flow-motion.md](flow-motion.md): flow motion is the camera, this file is what the camera finds.

## 1. One world, two colours
- The whole story is **two sides in two colours** (red kingdom, teal kingdom). The colours repeat on flags, armies,
  shields, cloaks, the signs, even the arrows and the stamps. The viewer never has to ask "who is this?".
- Give every hero and rival one **silhouette prop** (crown, helmet with a plume, apron, nightcap) and keep it on
  them in every shot. A callback prop appears at the end (the king now wears a wizard hat).
- The place is one **connected map**: castle → bridge → river valley → long straight road between armies → night
  village → blacksmith's house → workshop → forge. Plan the map first, then plan the camera route through it.

## 2. In-world text and counters (not overlays)
- Numbers live **on objects in the scene**: a wooden board "YEARS AT WAR" with an odometer that clicks `099 → 100`
  exactly on the spoken word. It is built from the scene's own parts (wood, flaps, shadows), never a flat label.
- The ending **bookends** it: the same board now reads `DAYS OF PEACE 001`. A counter reset is a joke and a loop.
- Documents get stamps that slam in on the key word (`IMPOSSIBLE` in red ink) and tags that slide in
  (`PIERCED BY: NOTHING`). Titles are printed on the document (`SPEAR & SHIELD`, `SCALE 1:10`), small and real.
- Captions are separate from this: 1-3 words, white, bold, dark outline, lower third, one word group at a time.

## 3. Camera moves that were used (and the recipe for each)
| moment | what the camera did | build it with |
|---|---|---|
| open | starts mid-action, banners already waving, a character is already talking | `camPath` that is already moving at frame 0 |
| sign reveal | whips sideways past the board, the odometer lands as the camera settles | `pass` (post) then a short settle in `camPath` |
| castle to valley | rises over a stone wall with ivy hanging in the foreground, then dives forward over a bridge into the valley | `camPath` crane + foreground parallax layer + `dive` |
| the long road | dead-centre, symmetric, the camera glides forward on a rail line between two armies | `camPath` push-in, vanishing point at the rail |
| time passing | the same composition, the sky cycles dusk → night → dawn in under two seconds, clouds keep scrolling | `tod` keys over time + moving cloud layer |
| the standoff | the camera cranes up high; both armies are arranged into two huge arrows aimed at each other, a spark sits where they meet | formation drawing + `camPath` crane + glow |
| the secret | tent drapes frame the two plotters, candle flickers; then the camera follows the messenger's glow through the night village to the door | `carry` the messenger, `portal` into the door |
| the blueprint | drops onto the table, the drawing animates (dotted lines draw on, a bright dot travels the spear's path), then the paper tears open like pages and the forge glow floods in | `dive` through a paper tear, stamps with squash |
| the punchline | forge fire, hammer sparks, an old rusty shield, price tags swinging on strings | settled shot, many small loops |

## 4. Small details checklist (each shot should have at least five of these)
- **Depth layers:** foreground leaves or ivy (blurred, slightly bigger), mid-ground action, far castles and mountains
  that barely move. Parallax on every camera move.
- **Light:** god rays through clouds, a lens glow at the focus point, rim light on faces near a candle or forge,
  warm-vs-cold contrast (orange candle in a blue night), a time of day that changes with the story (`tod`).
- **Things that live in the scene:** pennants flapping on their own, clouds sliding, grass swaying, dust motes,
  candle flame flicker, smoke from chimneys, tiny soldiers who shift their weight.
- **A story told by small props:** helmets on the ground with flowers growing out of them (the war went on so
  long that nature moved in), a crown that tilts, an anvil with a dent, a bell tag with a price.
- **Eyes and brows do the acting:** every character reacts one beat before the line, and **idles** (breath, a slow
  sway, a blink every 2-4 s) in every held frame.
- **Impacts have a tail:** a squash and stretch, a spark burst, a shake that decays, dust that settles.
- **Scale as data:** an army is drawn as thousands of tiny soldiers in blocks of colour, so a number reads as a
  *crowd* before it reads as a figure. Draw formations (columns, arrows), never random scatter.

## 5. Story shape of the original (what to reuse as a pattern)
1. **Cold open on the paradox, in a scene:** two people, two objects, one impossible claim, within 3 s.
2. **Stakes by a counter:** "100 years at war" with the odometer.
3. **Time-lapse proof:** a week passes, the armies stare, nothing moves, the sky cycles.
4. **The secret plot:** a plan is made quietly; a messenger crosses the map.
5. **The reveal on paper:** the answer is a plan on a blueprint, with stamps (`IMPOSSIBLE`).
6. **The twist, in the forge:** the one who made both of them laughs; the twist is who benefits.
7. **Bookend:** back to the board; the counter now says peace. A callback prop on the king.

## 6. How to apply in the six styles
- Plan every shot's **layer list** (foreground / mid / back / light / living details) next to the signature move.
- Plan the **map** (a route of places) and the **counters** (what number lives on which object) in the plan screen.
- 2D styles: `camPath` + `tod` + layered `draw` with `FX` helpers for glow and dust. 3D styles: `pathCam`,
  `followCam`, a `tod` light rig, and instanced soldiers for armies.
- The retention rules still win: a re-hook at least every 5 s, motion in every frame, the hook in frame 0.

## 7. The channel playbook: patterns across 14 shorts
Studied as 60-frame contact sheets (2026-11-05): Spear vs Shield, Pirate Cannonballs, Perfect Railroads, Second Draw,
Pink Prison Cell, Storm Oil, Mirror Horse Race, Town Built Around a Button, Every Memory Has a Price, Winning Tickets
Just by Looking, Grave Bell, Cashiers Keep Winning, Burglar Who Only Moved Furniture, Knight's Loophole. The rules
below held in nearly all of them. The channel's older sketch-comedy shorts were not studied.

### Format
- **Length 40-78 s, most around 60 s.** Story explainers have room to breathe. Plan these at **50-65 s**
  (~150-180 words) unless the user asks for shorter; quick tips stay at 30-35 s.
- **Look = Tall Tale 3D:** flat round-headed cartoon people with ink outlines, dot eyes and big brows, acting in a
  sunny or lamp-lit 3D world. For any "why / how / the X who…" story, choose Tall Tale 3D first.
- **Titles:** "Why X…", "How a X rigged Y", "The X who only…", "Every X has a price", "Levels of X",
  "The X that warned…". A strange specific object or rule, never a generic topic.
- **Captions:** 1-2 words at a time, white, bold, black outline, centred low. No highlight colour.

### Story
1. **Frame 0 is someone doing a strange thing** (painting one cell pink, pouring oil into the sea, ringing a bell on a
   grave, climbing in a window to move a sofa). Never a title, never a talking head that just explains.
2. **A hero with one prop** (chef hat, police cap, nightcap, crown, glasses) plus a **rival or doubter** who laughs at the idea.
3. **A home base** visited 3-5 times (the booth, the counter, the mess hall, the shop). Each visit shows a change.
4. **The science or rule shown as a thing in the world:** paint mixed in two buckets, oil flattening the waves, a
   string running down to a coffin, a gauge with a price, a notice pinned to a wall.
5. **The twist is about who wins** (the smith sold both, the cashier keeps the tickets, the knight's pardon covers
   next week too).
6. **The ending returns to the home base** or the first image: a loop, a callback prop, a final reaction. A
   follow card, if used, sits on that last image instead of replacing it.

### Visual devices (each video uses 4-6 of them)
| device | seen in | how to build it |
|---|---|---|
| **cutaway through the ground or a wall**: the camera cranes down through soil layers or through a hull | Grave Bell, Storm Oil | `camPath` vertical crane, layered cross-section drawing |
| **god's-eye reveal**: the camera rises straight up to a top-down map (a town in rings, a room whose furniture spins) | Button Town, Burglar, Pink Prison | `pathCam` up to an overhead shot, `roll` for the spin |
| **a world inside an object**: dive into a jar, ticket, pot of oil or blueprint and land in another place | Memory Price, Winning Tickets, Storm Oil, Spear | `portal` with `hole: 'rect'`/`circle` on the object |
| **lens POV**: a circle mask (telescope, keyhole, mirror) shows what a character sees | Mirror Race, Burglar | circular clip + vignette + a slight drift |
| **document close-up**: a pardon, a notice, a list being crossed out, a quill writing the key words | Knight, Pink Prison, Memory Price | flat paper on the table, text writes on in sync with the words, stamps |
| **scale by stacking**: a tower of tickets or notices, a wall of number grids, crowds in formation | Cashiers, Knight, Winning Tickets, Button Town | instanced copies, then a crane up the stack |
| **dream grade**: an imagined future in a different light (a purple midnight yacht) | Cashiers, Memory Price | change `tod` and palette for the fantasy, then snap back to the plain present |
| **time passes by seasons or sky**: summer → snow, day → night → dawn | Grave Bell, Spear, Pirate | `tod` keys + season palettes on the same set |
| **a witness**: an animal or bystander reacts to every beat (the cat on the sofa) | Burglar | one reaction pose per scene, a running gag |
| **colour on the face**: a face turns green or red with the emotion | Winning Tickets, Pink Prison | tint the face fill for 0.5-1 s, eased |
| **invented brands on every prop**: shop signs, ticket names, labels, "OUR WINNERS" walls | Cashiers, Winning Tickets, Memory Price | generic invented names only (skill rule: no real brands) |

### Light
- Almost every video has a **night or lamp-lit stretch** (deep blue with warm practical lights: candles, windows,
  lanterns, a forge). Warm = safe, memory, money. Cold = danger, the present, the law.
- Many end on a **sunset** (characters walk away, the light goes gold).
- One dominant colour per video (pink for the prison, gold for the lottery, deep blue for the storm) so a single
  frame is recognisable.
