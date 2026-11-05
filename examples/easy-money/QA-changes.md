# Change log

1. Captions: made gold word on 'Get-rich-quick' render; caption words now match the spoken words (actually work / sell the stuff / turns into cash / for your neighbors). Touches S02-S07 captions only.
2. S11/S12: S12 now cuts on "money" (25.26) instead of 24.77, so TWIST holds ~0.9 s instead of ~0.3 s. Touches S11, S12 timing + S12 cues.
3. S13: counter rolls over 0.55 s while pills fly in (was 0.1 s); raining coins drawn behind the counter; CLOSER pill moved to y 720 (was touching counter).
4. S14: disclaimer moved inside the card (was crossing hero head); button y 950; hero smaller; arrow retargeted.
5. S04 bike/shirt/phone landing spots and S08 dog moved left into the x ≤ 940 safe zone.
6. S05 items enlarged (phone 1.5, bike 1.2, shirt 1.15); scribble resized.
7. S12 check moved to x 860 (safe zone).
8. main.js: preload the 800-weight caption font (frame 0 caption rendered in a serif fallback). Touches every caption; verified on full sheet.
9. S05: items repositioned/resized into the safe zone; red scribble (crossed the shirt) replaced by dust puffs on each landing + an "= CASH" pill. Cue changed to a pop.
10. S06: coin burst radius reduced so coins stay inside the frame safe zone.
11. S14: hand arrow (cut through disclaimer) replaced by pulsing gold rings around the FOLLOW button; disclaimer refit to 620 px wide.
12. Flow motion: every cut is now a world hand-off (portal into phone/laptop/door, dust and soap smoke, hedge and post passes, coin carries, dive into tile 1); camera paths on S04 and S13; light warms to sunset across S12-S14. Touches every cut and S04, S12-S14.
13. flow.js: dive blows the old shot past the lens faster (no double image); carry blur reduced (vertical smear). S14: card already popped while the portal opens onto it.
