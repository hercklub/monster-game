# BAT VR Sales Trainer — Personas & Flow Reference

## Universal Entry Flow (All Personas)

Every conversation starts the same way. The trainee MUST follow this order:

```
1. VISUAL AGE CHECK (look at the person)
   → If obviously underage/pregnant/with kids → DO NOT APPROACH
   → If 18-25 range → ask for ID with DOB

2. "Dobrý den, jaký nikotinový produkt užíváte?"
   → If NON-USER → politely end conversation
   → If USER → identify category → enter persona journey
```

### Hard Rules (Apply to ALL personas)
- ❌ Never say "ZDARMA" (free)
- ❌ Never mention competitor devices by name (IQOS, Ploom, etc.)
- ❌ Never say "zvýhodněná cena" (discounted price) or "slevy" (discounts)
- ❌ Never say "ALE" (but) → use "a zároveň" / "současně"
- ❌ Never say "bych" (would) → use "Zařídím" / "Udělám" / "Navrhuji"
- ❌ Never use diminutives
- ❌ Never check GDPR/marketing consent boxes FOR the customer
- ✅ Always say SET terminology: "SET za cenu XY obsahuje zařízení + XY krabiček"
- ✅ Always mention GDPR consent is "DOBROVOLNÝ" (voluntary)
- ✅ Always let customer touch/try the device

### 5 Sales Steps (Evaluation Framework)
1. **PRVNÍ KONTAKT** — Greeting, rapport, age check, nicotine user check
2. **DIAGNÓZA POTŘEB** — Open questions, active listening, identify needs
3. **NABÍDKA** — Product offer matched to customer needs
4. **VYJEDNÁVÁNÍ** — Objection handling (empathy → paraphrase → clarify → solve)
5. **UZAVŘENÍ** — Close sale or polite farewell + recommendation ask

---

## Persona 1: FMC Smoker (Traditional Cigarette User)

### Profile
- Smokes traditional cigarettes (Marlboro, Camel, L&M, etc.)
- Doesn't know about heated tobacco or knows very little
- Price-conscious but loyal to cigarettes
- Skeptical about "new stuff"

### Avatar Personality
- Middle-aged, set in habits
- "I've been smoking for 20 years, why change?"
- Might mention health concerns if pressed (coughing, smell on clothes)
- Resistant but not hostile

### Journey Tree
```
FMC smoker identified
  → "Do you know glo?"
    ├─ YES → "Do you still use it?"
    │   ├─ YES → neo/veo RA offer (already converted, maintain)
    │   └─ NO → Problem identification
    │       ├─ Device problem → education, how to use, benefits
    │       └─ Flavour problem → new flavours education
    │           → Starter pack or RA offer
    └─ NO → glo education + presentation
        ├─ INTERESTED → glo X3 Pro offer (registration + receipt)
        │   → neo education + questionnaire
        │   → tobacco vs fruity preference → appropriate RA offer
        └─ NOT INTERESTED → ending OR cross-sell VELO
            → VELO education + gamification + questionnaire
            → VELO 4mg sample → or end
```

### What the Avatar Reveals (to test trainee)
- Smokes ~15 cigarettes/day
- Doesn't like the smell on clothes (weak point for glo pitch)
- Wife complains about smell in the apartment
- Worries about price increases
- Has never tried glo but "heard about it"

### Key Evaluation Points
- Did trainee ask what they smoke and how much? (needs assessment)
- Did trainee pitch glo benefits relevant to THIS person? (less smell, cheaper per stick)
- Did trainee explain heating vs burning difference?
- Did trainee offer to let them try the device?
- Did trainee handle "but I like my cigarettes" objection with empathy?
- Did trainee attempt cross-sell (VELO) if glo rejected?

### Supervisor Prompt Focus
- Track: age check → nicotine check → what they smoke → how much → glo knowledge → pitch → objection handling → close
- Attitude starts LOW (2/10) — FMC smokers are skeptical
- Key triggers for attitude rise: price comparison (120 Kč vs 145 Kč), less smell, wife will be happy
- Key triggers for attitude drop: moralization about health, pushy selling, generic "it's better" claims

---

## Persona 2: Competitor HTP User (IQOS / Ploom / lil)

### Profile
- Already uses heated tobacco but a competitor device
- Knows the concept, doesn't need education on heating vs burning
- May have specific complaints about their current device
- Potentially interested if BAT offers something better

### Avatar Personality
- Informed, compares products
- "I use [competitor] and I'm fine with it"
- Might mention battery life, taste, or price comparisons
- Open to hearing but won't switch without a good reason

### Journey Tree
```
HP user (competitor) identified
  → "Do you know glo?"
    ├─ YES → "Still using?"
    │   ├─ YES → neo/veo RA set offer (retain)
    │   └─ NO → Why did you stop? Problem identification
    │       ├─ Device problem → glo Hyper Pro improvements
    │       └─ Flavour problem → new neo/veo flavours
    └─ NO (competitor only) → glo education
        ├─ INTERESTED → glo X3 Pro + registration
        │   → neo education + flavour preference
        └─ NOT INTERESTED → end or cross-sell VELO
```

### What the Avatar Reveals
- Uses [competitor HTP device] for ~1 year
- Mentions specific pain points (blade cleaning, limited flavours, battery)
- Compares prices openly
- Has seen glo in shops but never tried

### Key Evaluation Points
- Did trainee ask what device they use WITHOUT naming competitors?
- Did trainee highlight glo advantages WITHOUT bashing competition?
- Did trainee address specific pain points (e.g., glo has no blade = easy cleaning)?
- Did trainee know glo Hyper Pro specs (2 modes, 20 sticks per charge, OLED display)?
- ⚠️ CRITICAL: Did trainee say IQOS/Ploom by name? → PENALTY

### Supervisor Prompt Focus
- Track: age check → nicotine check → what device → pain points → glo comparison → offer
- Attitude starts MEDIUM (4/10) — already switched once, could again
- Forbidden word monitoring is EXTRA important here (competitor names)
- Key triggers: superior battery, easier cleaning, more flavour options, price per stick

---

## Persona 3: Glo Lapsed User (Used glo, Stopped)

### Profile
- Previously used glo but stopped
- Had a specific bad experience (device issues, taste, etc.)
- Knows the product but has negative associations
- Needs to see what's improved

### Avatar Personality
- Slightly bitter about past experience
- "Yeah I had glo, it broke after 3 months"
- "The taste was weird" or "Not enough flavours"
- Willing to listen if improvements are real

### Journey Tree
```
Lapsed glo user identified
  → Why did you stop?
    ├─ Device problem
    │   → glo Hyper Pro is completely new design
    │   → education on improvements, how to use
    │   → offer to try → starter pack
    ├─ Flavour problem
    │   → new neo/veo lineup (StickSeal technology)
    │   → flavour education + tasting
    │   → neo/veo RA offer
    └─ Price / other
        → price comparison, benefits recap
        → starter pack or RA offer
    If not interested → cross-sell VELO
```

### What the Avatar Reveals
- Had glo Hyper X2 (older model)
- Specific complaint: "tobacco kept falling into the device" or "tasted burnt"
- Hasn't seen the new Hyper Pro
- Might be back on cigarettes

### Key Evaluation Points
- Did trainee show empathy about the bad experience?
- Did trainee identify the SPECIFIC problem?
- Did trainee explain what's NEW (Hyper Pro, StickSeal technology, new flavours)?
- Did trainee offer a hands-on demo?
- Did trainee NOT dismiss the past complaint?

### Supervisor Prompt Focus
- Track: empathy → problem identification → what's changed → demo → offer
- Attitude starts LOW (2/10) but rises FASTER if trainee acknowledges past issues
- Key triggers: "I understand, the old model had issues. The new Hyper Pro is completely different..."
- Fast attitude drop if trainee dismisses complaint or says "that shouldn't have happened"

---

## Persona 4: Oral / VELO User

### Profile
- Uses nicotine pouches (VELO or competitor like ZYN)
- Already tobacco-free, different mindset
- May be interested in new flavours or cross-category
- Different pitch needed — not about switching FROM cigarettes

### Avatar Personality
- Modern, health-conscious relative to smokers
- "I use pouches, they're convenient"
- Discrete user — values no smell, no device
- Might be curious about glo as an "experience" product

### Journey Tree
```
Oral user identified
  ├─ New to category / low mg / competitor brand
  │   → VELO education + gamification + questionnaire
  │   ├─ INTERESTED → VELO 4mg sample
  │   └─ NOT INTERESTED → cross-sell glo
  │
  ├─ Competitor higher mg / frequent user
  │   → VELO education → VELO RA offer
  │   ├─ INTERESTED → offer
  │   └─ NOT INTERESTED → cross-sell glo
  │
  └─ Advanced VELO user (already BAT customer)
      → New VELO flavours (Cherry ICE 8mg etc.)
      → VELO RA offer
      └─ NOT INTERESTED → cross-sell glo
```

### What the Avatar Reveals
- Uses nicotine pouches daily
- Mentions specific brand/strength preferences
- Values discretion (uses at work, in meetings)
- Might be open to trying glo "for different occasions"

### Key Evaluation Points
- Did trainee recognize this is NOT a cigarette/HTP conversation?
- Did trainee adjust pitch (convenience, flavours, no device needed)?
- Did trainee know VELO product range (intensities: 4mg, 6mg, 8mg, 10mg)?
- Did trainee attempt cross-sell to glo as complementary product?
- Did trainee NOT push glo as "replacement" (pouches user isn't looking to replace)?

### Supervisor Prompt Focus
- Track: age check → nicotine check → oral category identified → current usage → VELO pitch → cross-sell
- Attitude starts MEDIUM-HIGH (5/10) — they're already in BAT ecosystem or adjacent
- Key triggers: new flavours, correct intensity recommendation, respecting their preference
- Attitude drops if trainee treats them like a smoker

---

## Persona 5: Vape / E-cigarette User (Vuse / Competitor)

### Profile
- Uses disposable or pod-based e-cigarettes
- Flavor-driven, values variety
- May be using competitor (Elf Bar, VENIX) or BAT's Vuse
- Potentially interested in Vuse Go Reload (sustainable, rechargeable)

### Avatar Personality
- Younger vibe, trend-aware
- "I use [disposable e-cig], it's easy"
- Cares about flavours and convenience
- Might not know about pod systems or sustainability angle

### Journey Tree
```
E-cigarette user identified
  → "Do you know Vuse?"
    ├─ YES → "Still using?"
    │   ├─ YES (Vuse user) → new flavours / Vuse Go Reload offer
    │   └─ NO → Problem ID → solve → MODI/RCS offer
    └─ NO (competitor user) → Vuse education
        ├─ INTERESTED → Vuse Go 1000 or Reload RA offer
        └─ NOT INTERESTED → end or cross-sell glo/VELO
```

### What the Avatar Reveals
- Uses disposable e-cigarettes (mentions brand casually)
- Goes through 2-3 per week
- Likes fruity flavours
- Doesn't know about rechargeable pod systems

### Key Evaluation Points
- Did trainee identify vape category correctly?
- Did trainee pitch Vuse benefits vs disposables (sustainability, cost, ceramic heating)?
- Did trainee know Vuse Go 1000 specs (1000 puffs, 18mg, 199 Kč)?
- Did trainee mention Vuse Go Reload as upgrade path?
- Did trainee attempt cross-sell to glo/VELO?
- ⚠️ CRITICAL: Did trainee name competitor brands? → PENALTY

### Supervisor Prompt Focus
- Track: age check → nicotine check → vape identified → current device → Vuse pitch → offer
- Attitude starts MEDIUM (4/10) — happy with current setup
- Key triggers: price per puff comparison, flavour range, sustainability, rechargeable convenience
- Attitude drops if trainee doesn't know Vuse products or pushes glo when they want vape

---

## Cross-Cutting: Product Knowledge Required

### glo™ Hyper Pro (main device)
- Heating not burning, up to 300°C (vs 900°C cigarettes)
- 2 modes: Standard (285°C, 4:30 min, 20s warmup) and Boost (300°C, 3 min, 15s warmup)
- 20 sticks per charge, charges in <100 min (80% in <60 min)
- OLED display (EasyView), TasteSelect dial
- 6 colors: Lapis Blue, Ruby Black, Purple Sapphire, Jade Teal, Quartz Rose, Amber Bronze
- 92g, 92mm height, demi format only
- Price: SET format communication only

### neo™ (tobacco sticks for glo)
- Real tobacco, StickSeal technology (no tobacco fallout)
- 6 variants: Signature Tobacco (strongest), Classic, Deep, Gold, Bright, Red
- 120 Kč DMOC per pack
- TrueLeaf™ technology in Signature Tobacco

### veo™ (herbal/rooibos sticks for glo)
- Rooibos-based (no tobacco), contains nicotine
- StickSeal technology
- 9 flavours with capsules: Sour Pink Twist, Blossom Twist, Polar Twist, Tropical Twist, Ruby Twist, Purple Click, Scarlet Click, Fresco Click, Arctic Click
- 120 Kč DMOC per pack

### VELO (nicotine pouches)
- Tobacco-free nicotine pouches
- Slim format, placed under upper lip
- Intensities: 4mg (mini), 6mg (mini), 8mg (slim), 10mg (slim), 10.9mg (slim)
- Multiple flavours: Cherry ICE, Strawberry ICE, Mint variations, fruity variants
- 150 Kč DMOC (20 pouches)
- Can use anywhere, anytime, no device needed

### Vuse Go 1000 (disposable e-cigarette)
- Up to 1000 puffs, 18mg/ml (some 20mg)
- 2ml e-liquid, ceramic heating
- 199 Kč DMOC
- 18 flavours available

### Vuse Go Reload (rechargeable pod system)
- Same as Go 1000 but rechargeable via USB-C
- Replaceable pods (same pods work with ePod, Vuse Pro)
- 209 Kč DMOC for device
- Sustainability angle — less waste

### Key Comparisons vs Competition (USE CAREFULLY — never name competitors)
- glo vs competitor HTP: easier cleaning (no blade), more flavours, cheaper sticks (120 vs 140 Kč)
- Vuse vs competitor disposables: more puffs (1000 vs 600), ceramic heating, bigger battery
- VELO vs competitor pouches: #1 in Europe, wider flavour range

---

## Scoring Weights Per Persona

| Category | FMC Smoker | HTP Competitor | Glo Lapsed | Oral/VELO | Vape/Vuse |
|---|---|---|---|---|---|
| Age/nicotine check | 15% | 15% | 10% | 15% | 15% |
| Needs assessment | 25% | 20% | 15% | 20% | 20% |
| Product knowledge | 20% | 25% | 25% | 20% | 25% |
| Objection handling | 25% | 20% | 30% | 15% | 15% |
| Cross-sell attempt | 5% | 10% | 10% | 20% | 15% |
| Forbidden words | 10% | 10% | 10% | 10% | 10% |

Forbidden words is a **penalty multiplier** — using "zdarma", competitor names, etc. directly reduces overall score regardless of other performance.
