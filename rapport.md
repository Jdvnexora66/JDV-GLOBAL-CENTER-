# Rapport de build
Branche : supabase-sync-2026-09-24 | commit : 7834d55f9c922e9e8b36ee898861d5144582c0b2
Résultat : npm=0 | tsc=2 | build=1 (0 = OK)
Erreurs TypeScript : 4

## Par dossier
```
      4 src/app/univers
```

## 150 premières erreurs
```
src/app/univers/[slug]/page.tsx(4,6): error TS1005: ',' expected.
src/app/univers/[slug]/page.tsx(6,52): error TS1005: ';' expected.
src/app/univers/[slug]/page.tsx(6,63): error TS1109: Expression expected.
src/app/univers/[slug]/page.tsx(7,1): error TS1185: Merge conflict marker encountered.
```

## Fin de npm install
```

added 533 packages in 8s
```

## Fin du build
```
⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

   ▲ Next.js 15.5.18

   Creating an optimized production build ...
Failed to compile.

./src/app/univers/[slug]/page.tsx
Error:   [31mx[0m Expected ',', got '/'
   ,-[[36;1;4m/home/runner/work/JDV-GLOBAL-CENTER-/JDV-GLOBAL-CENTER-/src/app/univers/[slug]/page.tsx[0m:4:1]
 [2m1[0m | import Link from 'next/link';
 [2m2[0m | import {
 [2m3[0m |   ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2,
 [2m4[0m |  feat/jdv-univers-dedicated-portals-v1
   : [35;1m     ^[0m
 [2m5[0m |   ChevronRight, Compass, Globe2, Headphones, LayoutGrid, Search,
 [2m6[0m |   ShieldCheck, Sparkles, Star, Users, Wallet, type LucideIcon,
 [2m7[0m | =======
   `----

Caused by:
    Syntax Error

Import trace for requested module:
./src/app/univers/[slug]/page.tsx


> Build failed because of webpack errors
```
