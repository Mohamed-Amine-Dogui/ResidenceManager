# ResidenceManager

**ResidenceManager** is a web application designed to manage a residential complex composed of multiple apartments. It offers functionality for booking, check-in/check-out, maintenance tracking, and billing. The app supports both light and dark mode and is in French.

## Table of Contents

1. [Setup](#1-setup)
2. [Project Structure](#2-project-structure)
3. [Styling and UI](#3-styling-and-ui)
4. [Routing](#4-routing)
5. [State Management](#5-state-management)
6. [API Integration](#6-api-integration)
7. [Authentication](#7-authentication)
8. [Internationalization (i18n)](#8-internationalization-i18n)
9. [Dark Mode Support](#9-dark-mode-support)
10. [Deployment](#10-deployment)

---

## 1. Setup

### 1.1 Create the Project

```bash
npm create vite@latest
```

When prompted:

- Project name: `residence`
- Framework: `React`
- Variant: `TypeScript`

Then run:

```bash
cd residence
npm install
```

### 1.2 Install Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

In `src/index.css`, add:

```css
@import "tailwindcss";
```

### 1.3 Update TypeScript Configuration

In `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

In `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 1.4 Use Compatible Node.js Version

Switch to a compatible version of Node.js (required for Vite 7+):

```bash
nvm use 22
```

Install Node.js types:

```bash
npm install -D @types/node
```

### 1.5 Configure Vite

Create or update `vite.config.ts`:

```ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path = path.replace(/^\/api/, "")),
      },
    },
  },
});
```

### 1.6 Initialize Shadcn UI

```bash
npx shadcn@latest init
```

- Framework detected: Vite
- Tailwind CSS: v4
- Base color: Slate
- Alias: `@/*`
- Output: One utility file created at `src/lib/utils.ts`

### 1.7 Run the App

```bash
npm run dev
```

The development server will be available at [http://localhost:3000](http://localhost:3000)

## Change `vite.config.ts`:

```ts
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(
  ({ command } = {
    base: command === "build" ? "/ResidenceManager/" : "/", // 👈 Dynamisch
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path = path.replace(/^\/api/, "")),
        },
      },
    },
  })
);
```

| Env             | `base` value         | Behaviour                                        |
| --------------- | -------------------- | ------------------------------------------------ |
| `npm run dev`   | `/`                  | Lokal läuft alles unter `http://localhost:3000/` |
| `npm run build` | `/ResidenceManager/` | Wird korrekt für GitHub Pages gebaut             |

---

1. For Development

```bash
npm run dev
```

2. For Deployment :

```bash
npm run deploy
```

--
For icons check : https://lucide.dev/icons/

For more Fancy react Effects check  :

https://reactbits.dev/backgrounds/ballpit
https://cssbuttons.io
viewport-ui.design
https://reactbits.dev/backgrounds/waves
https://reactbits.dev/backgrounds/threads

 https://reactbits.dev/animations/star-border
 https://reactbits.dev/text-animations/split-text
 https://reactbits.dev/text-animations/shiny-text
 https://reactbits.dev/text-animations/decrypted-text
 https://reactbits.dev/animations/animated-content
 https://reactbits.dev/animations/fade-content
 https://reactbits.dev/text-animations/text-type
 https://reactbits.dev/text-animations/falling-text
 https://reactbits.dev/components/circular-gallery
 https://reactbits.dev/components/magic-bento
 https://reactbits.dev/components/profile-card
 https://reactbits.dev/components/carousel
 https://reactbits.dev/components/spotlight-card


```bash
npm install lucide-react
npm install sonner
npm install react-router-dom
npm install date-fns
npm install recharts
npx shadcn@latest add calendar
npx shadcn@latest add switch
npx shadcn@latest add tooltip
npx shadcn@latest add button
npx shadcn@latest add popover
npx shadcn@latest add chart
npx shadcn@latest add checkbox
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add alert-dialog
npx shadcn@latest add resizable
nme

```


---

**Prompt for v0.dev:**

## HomePage.jsx

Build a responsive React component (page) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The design must support both light mode and dark mode, using the "slate" color palette.

The **content of the UI must be entirely in French** (labels, text, headings, etc.).

This page represents the **Accueil (Dashboard) page** of a residence manager app and should include:

### 1. Date Picker

- A date picker component (with input field)
- Defaults to today’s date
- The user can change the date to filter the dashboard data

### 2. Key Metrics (Stats Overview)

Display a grid of simple and elegant cards, each showing one of the following stats with an icon and a number:

- Nombre de check-in
- Nombre de check-out
- Nombre de maintenances à effectuer
- Nombre de maisons prêtes
- Nombre de paiements complétés
- Nombre de paiements ouverts
- Nombre de paiements d’avance (when a guest pays partially to reserve)

### 3. Charts

- A **pie chart** showing the % of houses booked on the selected date (based on 13 total houses)
- A **gradient area chart** showing the evolution of money earned during the selected month

Use `lucide-react` for icons and `recharts` for the charts.
Keep the layout responsive for mobile and desktop.
Position the content in a clean, modern, and easy-to-read layout using Tailwind.
All texts and labels must be in French.

## use the "slate" color palette this dark mode and normal mode (that I can select from the privous Navbar)use minimalistic and modern design (like shadcn)

## ReservationPage.tsx

Build a responsive React component (page) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The layout must be responsive for mobile and desktop, clean and easy to read.
Use the "slate" color palette, and support both dark mode and normal mode (mode is selected via a toggle in the existing Navbar).

All UI content must be in French (labels, inputs, button texts, toasts, etc.).
Use lucide-react for icons where appropriate.

This page represents the Réservation page (ReservationPage.tsx) of a residence manager app and must include the following:

1. Filter
   A dropdown or select input to choose a house

2. Range Calendar

- A calendar that show the booked period for the house
- we can select also the montha and year of this Calender

Already booked periods must be shown with a distinct shade from the slate palette (blue colored )

3. Reservation Form
   -Input field: Nom (required)

- Input field: Téléphone
- Input field: Email
- Date Picker: Date d’arrivée (Check-in)
- Date Picker: Date de départ (Check-out)
- Input field: Montant payé en avance
- Input field: Montant restant
- Input field: Montant total (required)
- A button: Valider

When the user clicks Valider:

- If the selected date range is available: show a success toast Réservation réussie
- If the selected house is already booked during that period: show an error toast Réservation impossible, la maison est déjà réservée dans cette période

4. Reservations Table
   A table listing all reservations for the selected house Columns: Nom, Téléphone, Email, Check-in, Check-out, Montant payé en avance, Montant restant, Montant total

Each row must:

- Begin with a checkbox to select the row
- Include Edit and Delete buttons

5. Edit / Delete behavior

- Selecting a row and clicking Edit fills the form with the row’s data
- After editing, clicking Valider updates the reservation
- Clicking Delete shows a toast confirmation dialog before deletion

After every add, edit, or delete:

- The table updates
- The range calendar updates to reflect the booked periods

## Keep everything minimal and elegant in shadcn style, in French, and slate-based color theme.

---

Build a responsive React component (page) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The layout must be responsive for mobile and desktop, clean and easy to read.
Use the "slate" color palette, and support both dark mode and normal mode (mode is selected via a toggle in the existing Navbar).

All UI content must be in French (labels, inputs, button texts, toasts, etc.).
Use lucide-react for icons where appropriate.

This page represents the CheckListePage page (CheckListePage.tsx) of a residence manager app and must include the following:

## Keep everything minimal and elegant in shadcn style, in French, and slate-based color theme.

## NotFoundPage.tsx

Build a responsive React component (NotFoundPage.tsx) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The layout must be responsive for mobile and desktop, clean and centered.
Use the "slate" color palette, and support both dark mode and normal mode (mode is selected via a toggle in the existing Navbar).

All UI content must be in French.
Use lucide-react for icons (optional, if it fits the visual design).

This page represents the 404 Not Found page of a residence manager app. It is shown when the user navigates to an undefined route.

The page should display:

- A large heading: 404 - Page non trouvée
- A subtitle: Cette page n’existe pas.
- A button labeled Retour à l’accueil that redirects the user to the homepage (/)

Center the content vertically and horizontally, keep the layout simple and elegant in shadcn style.

---

## CheckListePage.tsx

Build a responsive React component (CheckListePage.tsx) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The layout must be responsive for mobile and desktop, clean, modern, and easy to read.
Use the "slate" color palette, and support both dark mode and normal mode, controlled via a toggle in the existing navbar.

All UI content must be in French (labels, inputs, table headers, button texts, toasts, etc.).
Use lucide-react for icons where appropriate.

This page represents the Checkliste page of a residence manager app. It must include the following:

use import { Toaster, toast } from "sonner";

1. Checklist Form
   A dropdown or select input to choose a house (from the following list):

const houses = [
{ id: "maison-1", name: "Mv1" },
{ id: "maison-2", name: "Mv2" },
{ id: "maison-3", name: "Mv3" },
{ id: "maison-4", name: "Mv4" },
{ id: "maison-5", name: "Mv5" },
{ id: "maison-6", name: "Mv6" },
{ id: "maison-7", name: "Mv7" },
{ id: "maison-8", name: "Mv8" },
{ id: "maison-9", name: "Mv9" },
{ id: "maison-10", name: "Mv10" },
{ id: "maison-bg", name: "Bg" },
{ id: "maison-high", name: "High" },
];
Input field: Étape (the number of the step)
Input field: Catégorie (e.g. Entrée, Salle de Bain, Couloir, etc.)
Input field: Description (e.g. "Nettoyage de la porte extérieure de la maison (poussière + araignées)")
Input field: Produit à utiliser (e.g. Javel, OMO, etc.)
Input field: Type (e.g. nettoyage, vérification, entretien)
A button: Valider
When the user clicks Valider:
The checklist entry is inserted into the checklist table below
If editing, the existing entry is updated
Show a success toast (Étape ajoutée avec succès or Étape mise à jour)

2. Checklist Table
   Displays all checklist entries for the selected house

Table columns (in French): Maison, Étape, Catégorie, Description, Produit à utiliser, Type, Actions

Each row must:

Start with an Actions column containing Edit and Delete buttons

3. Edit / Delete Behavior
   Clicking Edit loads the row’s data into the form for modification

Clicking Delete shows a confirmation toast before deletion (Êtes-vous sûr de vouloir supprimer cette étape ?)

After deletion or update, the table is refreshed

4. Mocked Data (for development/testing)
   Use the following object as mock backend data for initial categories and steps:

this is for mocking the backend

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Entrée",
      "steps": [
        {
          "id": 1,
          "description": "Nettoyage de la porte extérieure de la maison (poussière + araignées)",
          "produits a utilise": "",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 2,
      "name": "Salle de Bain",
      "steps": [
        {
          "id": 2,
          "description": "Nettoyage de (lavabo + toilette + douche)",
          "produits a utilise": "détartrant, OMO, Javel",
          "type": "nettoyage"
        },
        {
          "id": 3,
          "description": "Nettoyage du miroir",
          "produits a utilise": "Ajax",
          "type": "nettoyage"
        },
        {
          "id": 4,
          "description": "Nettoyage interne de toilette",
          "produits a utilise": "Choc",
          "type": "nettoyage"
        },
        {
          "id": 5,
          "description": "Nettoyage de tout le faïence des murs",
          "produits a utilise": "OMO, Javel, détartrant",
          "type": "nettoyage"
        },
        {
          "id": 6,
          "description": "Vérification de la validité de : chasse, douche, toilette, lampe, eau chaude",
          "produits a utilise": "",
          "type": "vérification"
        },
        {
          "id": 7,
          "description": "Vérification de la présence de : seau, bassine, frottoir, balai, serpillière",
          "produits a utilise": "",
          "type": "vérification"
        }
      ]
    },
    {
      "id": 3,
      "name": "Couloir",
      "steps": [
        {
          "id": 8,
          "description": "Vérification de la validité de la lampe",
          "produits a utilise": "",
          "type": "vérification"
        },
        {
          "id": 9,
          "description": "Nettoyage des toiles d’araignées (plafond et coins des murs)",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 10,
          "description": "Nettoyage de la faïence des murs",
          "produits a utilise": "OMO, Javel",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 4,
      "name": "Cuisine",
      "steps": [
        {
          "id": 11,
          "description": "Nettoyage du réfrigérateur (enlever tous les supports internes)",
          "produits a utilise": "OMO, Javel, dégraissant, détartrant, zestes",
          "type": "nettoyage"
        },
        {
          "id": 12,
          "description": "Nettoyage du gaz + nettoyage du four",
          "produits a utilise": "OMO, dégraissant, Javel",
          "type": "nettoyage"
        },
        {
          "id": 13,
          "description": "Nettoyage du plan de travail en marbre",
          "produits a utilise": "OMO, dégraissant, Javel, détartrant",
          "type": "nettoyage"
        },
        {
          "id": 14,
          "description": "Nettoyage de la fenêtre (vitre + bois) + porte cuisine",
          "produits a utilise": "OMO, Javel, Ajax",
          "type": "nettoyage"
        },
        {
          "id": 15,
          "description": "Nettoyage du placard + étagères de la cuisine (de l’intérieur + extérieur)",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 16,
          "description": "Nettoyage de la faïence (autour du gaz, des taches d’huiles)",
          "produits a utilise": "dégraissant, OMO, Javel",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 5,
      "name": "Chambres",
      "steps": [
        {
          "id": 17,
          "description": "Enlèvement des toiles d’araignées",
          "produits a utilise": [],
          "type": "nettoyage"
        },
        {
          "id": 18,
          "description": "Changement des draps + oreillers ou secouer s’ils sont propres",
          "produits a utilise": "",
          "type": "entretien"
        },
        {
          "id": 19,
          "description": "Enlever la poussière des étagères du placard",
          "produits a utilise": "",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 6,
      "name": "Extérieur",
      "steps": [
        {
          "id": 20,
          "description": "Nettoyage des balcons + véranda",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 21,
          "description": "Nettoyage de la table + chaises plastiques",
          "produits a utilise": "OMO, Javel",
          "type": "nettoyage"
        },
        {
          "id": 22,
          "description": "Nettoyage du parterre de toute la maison",
          "produits a utilise": "eau, Javel",
          "type": "nettoyage"
        }
      ]
    }
  ]
}
```

---

## ControlPage.tsx

Build a responsive React component (`ControlPage.tsx`) using **shadcn/ui** and **Tailwind CSS**, with a **minimalistic and modern design** (like shadcn).

The layout must be responsive for both mobile and desktop, clean and easy to read.
Use the **"slate" color palette**, and support **dark mode and light mode**, toggled through the existing navbar.

All UI content must be in **French** (labels, buttons, toasts, etc.).
Use `lucide-react` for icons.
Use the following import for notifications:

```tsx
import { Toaster, toast } from "sonner";
```

This page is called **ControlPage.tsx** and represents a control interface for verifying house readiness.

### 1. House Selector

* A dropdown/select input to choose a house from the following list:

```ts
const houses = [
  { id: "maison-1", name: "Mv1" },
  { id: "maison-2", name: "Mv2" },
  { id: "maison-3", name: "Mv3" },
  { id: "maison-4", name: "Mv4" },
  { id: "maison-5", name: "Mv5" },
  { id: "maison-6", name: "Mv6" },
  { id: "maison-7", name: "Mv7" },
  { id: "maison-8", name: "Mv8" },
  { id: "maison-9", name: "Mv9" },
  { id: "maison-10", name: "Mv10" },
  { id: "maison-bg", name: "Bg" },
  { id: "maison-high", name: "High" },
];
```

### 2. Interactive Pie Chart

* A pie chart displaying the **readiness percentage** of the selected house
* Each category below contributes equally (20%)
* When **all checkboxes in a card are checked**, that category is considered "ready"
* If all 6 cards are "ready", the chart becomes **100%** and its color turns **green** to indicate the house is fully ready
* Otherwise, show current percentage (e.g. 40%) in blue

### 3. Category Cards (x6)

Display the following 6 cards, one for each checklist category. Each card contains:

* A title: category name
* A list of tasks (checkboxes with descriptions)
* Each task shows the **label** and the **product(s) to use**, like "Javel", "OMO", etc.
* A button `Prêt` (in each card) that checks all boxes in that category
* Once all tasks in a card are selected, mark the card as ready and update the pie chart

#### Categories and their Tasks (French labels and product info):

**Entrée**

* Nettoyage de la porte extérieure de la maison (poussière + araignées)

**Salle de Bain**

* Nettoyage de (lavabo + toilette + douche): détartrant, OMO, Javel
* Nettoyage du miroir: Ajax
* Nettoyage interne de toilette: Choc
* Nettoyage de tout le faïence des murs: OMO, Javel, détartrant
* Vérification de la validité de : chasse, douche, toilette, lampe, eau chaude
* Vérification de la présence de : seau, bassine, frottoir, balai, serpillière

**Couloir**

* Vérification de la validité de la lampe
* Nettoyage des toiles d’araignées (plafond et coins des murs)
* Nettoyage de la faïence des murs: OMO, Javel

**Cuisine**

* Nettoyage du réfrigérateur (enlever tous les supports internes): OMO, Javel, dégraissant, détartrant, zestes
* Nettoyage du gaz + nettoyage du four: OMO, dégraissant, Javel
* Nettoyage du plan de travail en marbre: OMO, dégraissant, Javel, détartrant
* Nettoyage de la fenêtre (vitre + bois) + porte cuisine: OMO, Javel, Ajax
* Nettoyage du placard + étagères de la cuisine (intérieur + extérieur)
* Nettoyage de la faïence (autour du gaz): dégraissant, OMO, Javel

**Chambres**

* Enlèvement des toiles d’araignées
* Changement des draps + oreillers (ou secouer si propres)
* Enlever la poussière des étagères du placard

**Extérieur**

* Nettoyage des balcons + véranda
* Nettoyage de la table + chaises plastiques: OMO, Javel
* Nettoyage du parterre de toute la maison: eau, Javel

---

Use minimal styling, slate color palette, and follow the design style of shadcn/ui.
Ensure that all labels, buttons, and interface text are in **French**, and that the page is fully responsive and functional.

this is for mocking the backend

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Entrée",
      "steps": [
        {
          "id": 1,
          "description": "Nettoyage de la porte extérieure de la maison (poussière + araignées)",
          "produits a utilise": "",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 2,
      "name": "Salle de Bain",
      "steps": [
        {
          "id": 2,
          "description": "Nettoyage de (lavabo + toilette + douche)",
          "produits a utilise": "détartrant, OMO, Javel",
          "type": "nettoyage"
        },
        {
          "id": 3,
          "description": "Nettoyage du miroir",
          "produits a utilise": "Ajax",
          "type": "nettoyage"
        },
        {
          "id": 4,
          "description": "Nettoyage interne de toilette",
          "produits a utilise": "Choc",
          "type": "nettoyage"
        },
        {
          "id": 5,
          "description": "Nettoyage de tout le faïence des murs",
          "produits a utilise": "OMO, Javel, détartrant",
          "type": "nettoyage"
        },
        {
          "id": 6,
          "description": "Vérification de la validité de : chasse, douche, toilette, lampe, eau chaude",
          "produits a utilise": "",
          "type": "vérification"
        },
        {
          "id": 7,
          "description": "Vérification de la présence de : seau, bassine, frottoir, balai, serpillière",
          "produits a utilise": "",
          "type": "vérification"
        }
      ]
    },
    {
      "id": 3,
      "name": "Couloir",
      "steps": [
        {
          "id": 8,
          "description": "Vérification de la validité de la lampe",
          "produits a utilise": "",
          "type": "vérification"
        },
        {
          "id": 9,
          "description": "Nettoyage des toiles d’araignées (plafond et coins des murs)",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 10,
          "description": "Nettoyage de la faïence des murs",
          "produits a utilise": "OMO, Javel",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 4,
      "name": "Cuisine",
      "steps": [
        {
          "id": 11,
          "description": "Nettoyage du réfrigérateur (enlever tous les supports internes)",
          "produits a utilise": "OMO, Javel, dégraissant, détartrant, zestes",
          "type": "nettoyage"
        },
        {
          "id": 12,
          "description": "Nettoyage du gaz + nettoyage du four",
          "produits a utilise": "OMO, dégraissant, Javel",
          "type": "nettoyage"
        },
        {
          "id": 13,
          "description": "Nettoyage du plan de travail en marbre",
          "produits a utilise": "OMO, dégraissant, Javel, détartrant",
          "type": "nettoyage"
        },
        {
          "id": 14,
          "description": "Nettoyage de la fenêtre (vitre + bois) + porte cuisine",
          "produits a utilise": "OMO, Javel, Ajax",
          "type": "nettoyage"
        },
        {
          "id": 15,
          "description": "Nettoyage du placard + étagères de la cuisine (de l’intérieur + extérieur)",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 16,
          "description": "Nettoyage de la faïence (autour du gaz, des taches d’huiles)",
          "produits a utilise": "dégraissant, OMO, Javel",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 5,
      "name": "Chambres",
      "steps": [
        {
          "id": 17,
          "description": "Enlèvement des toiles d’araignées",
          "produits a utilise": [],
          "type": "nettoyage"
        },
        {
          "id": 18,
          "description": "Changement des draps + oreillers ou secouer s’ils sont propres",
          "produits a utilise": "",
          "type": "entretien"
        },
        {
          "id": 19,
          "description": "Enlever la poussière des étagères du placard",
          "produits a utilise": "",
          "type": "nettoyage"
        }
      ]
    },
    {
      "id": 6,
      "name": "Extérieur",
      "steps": [
        {
          "id": 20,
          "description": "Nettoyage des balcons + véranda",
          "produits a utilise": "",
          "type": "nettoyage"
        },
        {
          "id": 21,
          "description": "Nettoyage de la table + chaises plastiques",
          "produits a utilise": "OMO, Javel",
          "type": "nettoyage"
        },
        {
          "id": 22,
          "description": "Nettoyage du parterre de toute la maison",
          "produits a utilise": "eau, Javel",
          "type": "nettoyage"
        }
      ]
    }
  ]
}
```


---




---


Build a responsive React component (CheckInOutPage.tsx.tsx) using shadcn/ui and Tailwind CSS with a minimalistic and modern design.

The layout must be responsive for mobile and desktop, clean, modern, and easy to read.
Use the "slate" color palette, and support both dark mode and normal mode, controlled via a toggle in the existing navbar.

All UI content must be in French (labels, inputs, table headers, button texts, toasts, etc.).
Use lucide-react for icons where appropriate.

This page represents the Checkliste page of a residence manager app. It must include the following:

use import { Toaster, toast } from "sonner";

use effect from this : https://reactbits.dev 





---

**Prompt for v0.dev:**

 Build a responsive React component (`CheckInOutPage.tsx`) using **shadcn/ui**, **Tailwind CSS**, and **lucide-react** icons.

 The layout must be responsive for mobile and desktop, with a clean and modern design in shadcn style.
 Use the **"slate" color palette** and support **dark mode and light mode**, toggled via an existing navbar.

 All UI content (labels, headers, buttons, placeholders, toasts) must be in **French**.
 Use `import { Toaster, toast } from "sonner"` for toast messages.


use effect that fitt from: https://reactbits.dev 
 ### Panel 1 – Check-in

 #### 1. House Selector

 A dropdown (`Select`) to choose a house from this list:

 ```ts
 const houses = [
   { id: "maison-1", name: "Mv1" },
   { id: "maison-2", name: "Mv2" },
   { id: "maison-3", name: "Mv3" },
   { id: "maison-4", name: "Mv4" },
   { id: "maison-5", name: "Mv5" },
   { id: "maison-6", name: "Mv6" },
   { id: "maison-7", name: "Mv7" },
   { id: "maison-8", name: "Mv8" },
   { id: "maison-9", name: "Mv9" },
   { id: "maison-10", name: "Mv10" },
   { id: "maison-bg", name: "Bg" },
   { id: "maison-high", name: "High" },
 ];
 ```

 #### 2. Client Info

 A form with the following inputs:

 * Nom
 * Téléphone
 * Email
 * Date d’arrivée
 * Date de départ
 * Paiement : montant payé, montant restant, montant total

 #### 3. État de l’équipement (Inventaire à l’entrée)

 Organize the checklist into **grouped sections**, with a mix of:

 * `InputNumber` for items with expected quantities
 * `Checkbox` for availability confirmation
 * `Textarea` for optional remarks or damaged/missing info

 ##### Literie & Mobilier

 * Lits simples (2 par défaut)
 * Lits doubles (1 par défaut)
 * Matelas supplémentaires
 * Oreillers disponibles
 * Tables
 * Chaises
 * Draps propres
 * Draps housse
 * Couvertures

 ##### Électronique & Équipements

 * Télévision (checkbox)
 * Télécommande TV (checkbox)
 * Climatiseur (checkbox)
 * Télécommande Climatiseur (checkbox)
 * Récepteur TV (optional checkbox)
 * Télécommande Récepteur (optional checkbox)

 ##### Cuisine

 * Assiettes
 * Verres
 * Couverts
 * Casseroles / Marmites
 * Poêles
 * Réfrigérateur (optional checkbox)

 ##### Autres

 * Rideaux présents (checkbox)
 * Lampes fonctionnelles (checkbox)
 * Balai / Serpillière / Seau (checkbox)

 #### 4. Final Action

 * Button: `Valider l’état des lieux`
 * Optional input: Nom ou signature du responsable du check-in

 Show a toast success message after submission (`Check-in enregistré avec succès`).

 ---

 ### Panel 2 – Check-out

 #### Step 1

 Ask the user to:

 * Enter Nom du client
 * Select Date d’arrivée
 * Choose Maison

 #### Step 2

 Once the record is found (simulate), show all the items from the original check-in inventory as **readonly checkboxes**.

 * User can verify and check if the items are still present and functional
 * Optional field: Commentaire final

 #### Final Action

 * Button: `Valider le départ`
 * Toast confirmation: `Check-out enregistré. La maison est maintenant disponible.`

 ---

 Use French UI, minimal modern design (shadcn style), slate color palette, and good structure. The resizable layout should clearly split Check-in and Check-out sections, and allow the user to focus on one side at a time.



---

- Entrée:

1. Nettoyage de la porte extérieure de la maison (poussière + araignées)

- Salle de Bain:

2. Nettoyage de (lavabo + toilette + douche): → détartrant + OMO + Javel
3. Nettoyage du miroir: → Ajax
4. Nettoyage interne de toilette: → choc
5. Nettoyage de tout le faïence des murs: → OMO + Javel + détartrant
6. Vérification de la validité de :

   - chasse
   - douche
   - toilette
   - lampe
   - eau chaude

7. Vérification de la présence de :
   - seau
   - bassine
   - frottoir
   - balai
   - serpillière

- Couloir:

8. Vérification de la validité de la lampe
9. Nettoyage des toiles d’araignées (plafond et coins des murs)
10. Nettoyage de la faïence des murs → OMO + Javel

- Cuisine:

11. Nettoyage du réfrigérateur : (enlever tous les supports internes) → OMO + Javel + dégraissant + détartrant + zestes
12. Nettoyage du gaz + nettoyage du four: → OMO + Dégraissant + Javel
13. Nettoyage du plan de travail en marbre: → OMO + dégraissant + javel + détartrant
14. Nettoyage de la fenêtre (vitre + bois) + porte cuisine : → OMO + Javel + Ajax
15. Nettoyage du placard + étagères de la cuisine (de l’intérieur + extérieur)
16. Nettoyage de la faïence (surtout au-dessus et autour du gaz, des taches d’huiles): → dégraissant + OMO + Javel

- Chambres:

17. Enlèvement des toiles d’araignées
18. Changement des draps + oreillers (s’ils sont sales) ou juste les secouer (s’ils sont propres)
19. Enlever la poussière des étagères du placard

- Extérieur :

20. Nettoyage des balcons + véranda
21. Nettoyage de la table + chaises plastiques → OMO + Javel
22. Nettoyage du parterre de toute la maison (→ eau + Javel)

```

```
